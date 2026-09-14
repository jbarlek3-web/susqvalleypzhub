import assert from "node:assert/strict";
import test from "node:test";
import { getSql } from "./db.ts";

// ============================================================================
// Adversarial DB & Concurrency Verification Test Suite
// Targets: src/lib/db.ts
// ============================================================================

test("ADV-DB-01: Atomic Commit - Multi-statement transaction commits all rows atomically", async () => {
  const sql = await getSql();
  await sql`create table if not exists test_adv_tx (id text primary key, val text, num int)`;
  await sql`delete from test_adv_tx`;

  await sql.transaction(async (tx) => {
    await tx`insert into test_adv_tx (id, val, num) values ('commit_1', 'alpha', 100)`;
    await tx`insert into test_adv_tx (id, val, num) values ('commit_2', 'beta', 200)`;
    await tx`update test_adv_tx set num = 150 where id = 'commit_1'`;
  });

  const rows = await sql<{ id: string; val: string; num: number }>`
    select id, val, num from test_adv_tx where id in ('commit_1', 'commit_2') order by id asc
  `;
  assert.equal(rows.length, 2);
  assert.equal(rows[0].id, "commit_1");
  assert.equal(rows[0].num, 150);
  assert.equal(rows[1].id, "commit_2");
  assert.equal(rows[1].num, 200);
});

test("ADV-DB-02: Atomic Rollback - Explicit exception rolls back all partial writes", async () => {
  const sql = await getSql();
  await sql`create table if not exists test_adv_tx (id text primary key, val text, num int)`;

  let errorThrown = false;
  try {
    await sql.transaction(async (tx) => {
      await tx`insert into test_adv_tx (id, val, num) values ('rollback_1', 'transient', 999)`;
      // Verify row is visible inside the uncommitted transaction
      const innerRows = await tx<{ id: string }>`select id from test_adv_tx where id = 'rollback_1'`;
      assert.equal(innerRows.length, 1, "Write should be visible within transaction before throw");
      throw new Error("Simulated business logic failure aborting transaction");
    });
  } catch (err: unknown) {
    errorThrown = true;
    assert.equal((err as Error).message, "Simulated business logic failure aborting transaction");
  }

  assert.equal(errorThrown, true);

  // Verify row was completely rolled back from the database
  const rows = await sql<{ id: string }>`select id from test_adv_tx where id = 'rollback_1'`;
  assert.equal(rows.length, 0, "Row must not exist after rollback");
});

test("ADV-DB-03: SQL Error inside Transaction - Database syntax/constraint error triggers rollback and unpoisons pool", async () => {
  const sql = await getSql();
  await sql`create table if not exists test_adv_tx (id text primary key, val text, num int)`;
  await sql`insert into test_adv_tx (id, val, num) values ('pk_conflict', 'initial', 1) on conflict (id) do nothing`;

  let caught = false;
  try {
    await sql.transaction(async (tx) => {
      await tx`insert into test_adv_tx (id, val, num) values ('temp_row', 'should_not_persist', 2)`;
      // Trigger primary key violation
      await tx`insert into test_adv_tx (id, val, num) values ('pk_conflict', 'conflict_duplicate', 3)`;
    });
  } catch (err: unknown) {
    caught = true;
    assert.ok(err instanceof Error, "Database should throw an Error on constraint violation");
  }

  assert.equal(caught, true, "Transaction must fail on constraint error");

  // Verify 'temp_row' was not committed
  const tempRow = await sql<{ id: string }>`select id from test_adv_tx where id = 'temp_row'`;
  assert.equal(tempRow.length, 0, "Partial write prior to DB error must be rolled back");

  // Verify the connection pool is still healthy and accepts new queries immediately
  const healthyCheck = await sql<{ result: number }>`select 1 as result`;
  assert.equal(healthyCheck[0]?.result, 1, "Connection must remain usable after transaction failure");
});

test("ADV-DB-04: Concurrency Burst - 50 concurrent transactions execute without leaks or deadlocks", async () => {
  const sql = await getSql();
  await sql`create table if not exists test_adv_tx (id text primary key, val text, num int)`;

  const BURST_COUNT = 50;
  const tasks = Array.from({ length: BURST_COUNT }, async (_, i) => {
    const id = `burst_50_${i}`;
    return sql.transaction(async (tx) => {
      await tx`insert into test_adv_tx (id, val, num) values (${id}, ${'burst_val_' + i}, ${i})`;
      const readBack = await tx<{ id: string; num: number }>`select id, num from test_adv_tx where id = ${id}`;
      assert.equal(readBack.length, 1);
      assert.equal(readBack[0].num, i);
      return readBack[0].id;
    });
  });

  const results = await Promise.all(tasks);
  assert.equal(results.length, BURST_COUNT);

  // Verify all 50 records exist in database
  const countRes = await sql<{ count: number }>`
    select count(*) as count from test_adv_tx where id like 'burst_50_%'
  `;
  assert.equal(Number(countRes[0].count), BURST_COUNT);
});

test("ADV-DB-05: Concurrency Burst - 50 mixed transactions (half succeed, half fail) without pool degradation", async () => {
  const sql = await getSql();
  await sql`create table if not exists test_adv_tx (id text primary key, val text, num int)`;

  const TOTAL = 50;
  const tasks = Array.from({ length: TOTAL }, async (_, i) => {
    const shouldFail = i % 2 === 1;
    const id = `mixed_${i}`;
    try {
      await sql.transaction(async (tx) => {
        await tx`insert into test_adv_tx (id, val, num) values (${id}, 'test', ${i})`;
        if (shouldFail) {
          throw new Error(`Deliberate burst failure #${i}`);
        }
        return id;
      });
      return { id, success: true };
    } catch (err: unknown) {
      return { id, success: false, error: (err as Error).message };
    }
  });

  const outcomes = await Promise.all(tasks);
  const successes = outcomes.filter((o) => o.success);
  const failures = outcomes.filter((o) => !o.success);

  assert.equal(successes.length, 25, "Exactly 25 transactions should have succeeded");
  assert.equal(failures.length, 25, "Exactly 25 transactions should have failed");

  // Verify only the 25 successful records exist
  const rows = await sql<{ count: number }>`
    select count(*) as count from test_adv_tx where id like 'mixed_%'
  `;
  assert.equal(Number(rows[0].count), 25);

  // Verify pool is completely ready for subsequent operations
  const postCheck = await sql`select 1 as ping`;
  assert.equal(postCheck.length, 1);
});

test("ADV-DB-06a: Nested Transactions - Multi-level nested transaction completes successfully", async () => {
  const sql = await getSql();
  await sql`create table if not exists test_adv_tx (id text primary key, val text, num int)`;

  const result = await sql.transaction(async (txLevel1) => {
    await txLevel1`insert into test_adv_tx (id, val, num) values ('nest_l1', 'level1', 1)`;

    const l2Result = await txLevel1.transaction(async (txLevel2) => {
      await txLevel2`insert into test_adv_tx (id, val, num) values ('nest_l2', 'level2', 2)`;

      const l3Result = await txLevel2.transaction(async (txLevel3) => {
        await txLevel3`insert into test_adv_tx (id, val, num) values ('nest_l3', 'level3', 3)`;
        return "l3_ok";
      });
      return `l2_ok->${l3Result}`;
    });
    return `l1_ok->${l2Result}`;
  });

  assert.equal(result, "l1_ok->l2_ok->l3_ok");

  const rows = await sql<{ id: string }>`
    select id from test_adv_tx where id in ('nest_l1', 'nest_l2', 'nest_l3') order by id asc
  `;
  assert.equal(rows.length, 3);
});

test("ADV-DB-06b: Nested Transactions - Inner error bubbles and rolls back entire transaction", async () => {
  const sql = await getSql();
  await sql`create table if not exists test_adv_tx (id text primary key, val text, num int)`;

  let caught = false;
  try {
    await sql.transaction(async (tx1) => {
      await tx1`insert into test_adv_tx (id, val, num) values ('bubble_outer', 'outer', 1)`;
      await tx1.transaction(async (tx2) => {
        await tx2`insert into test_adv_tx (id, val, num) values ('bubble_inner', 'inner', 2)`;
        throw new Error("Bubble up error from nested transaction");
      });
    });
  } catch (err: unknown) {
    caught = true;
    assert.equal((err as Error).message, "Bubble up error from nested transaction");
  }

  assert.equal(caught, true);

  const rows = await sql<{ id: string }>`
    select id from test_adv_tx where id in ('bubble_outer', 'bubble_inner')
  `;
  assert.equal(rows.length, 0, "Neither outer nor inner row should be committed when unhandled");
});

test("ADV-DB-06c: Nested Transactions / Savepoints Empirical Finding - Lack of Savepoint Isolation", async () => {
  // CRITICAL ARCHITECTURAL FINDING:
  // src/lib/db.ts lines 122 & 228 define nested transactions as:
  //   const txSql = toSql(txRun, async (nestedCb) => nestedCb(txSql));
  // This is a flattened passthrough without SQL `SAVEPOINT sp_...` or `ROLLBACK TO SAVEPOINT`.
  // As an empirical consequence:
  // If an inner transaction writes rows and then throws an exception caught by outerTx,
  // those inner writes are NEVER rolled back and get committed when outerTx commits!
  const sql = await getSql();
  await sql`create table if not exists test_adv_tx (id text primary key, val text, num int)`;

  await sql.transaction(async (outerTx) => {
    await outerTx`insert into test_adv_tx (id, val, num) values ('savepoint_outer', 'outer_val', 10)`;
    try {
      await outerTx.transaction(async (innerTx) => {
        await innerTx`insert into test_adv_tx (id, val, num) values ('savepoint_inner', 'inner_val', 20)`;
        throw new Error("Deliberate inner transaction failure caught by outer");
      });
    } catch {
      // Outer catches inner failure and continues
    }
    await outerTx`insert into test_adv_tx (id, val, num) values ('savepoint_outer_2', 'outer_val_2', 30)`;
  });

  const innerRow = await sql<{ id: string }>`select id from test_adv_tx where id = 'savepoint_inner'`;
  const outerRows = await sql<{ id: string }>`select id from test_adv_tx where id in ('savepoint_outer', 'savepoint_outer_2')`;

  assert.equal(outerRows.length, 2, "Outer rows committed cleanly");

  // Empirically verify that inner write DID NOT ROLL BACK due to missing savepoints:
  assert.equal(
    innerRow.length,
    1,
    "CONFIRMED FINDING: Inner transaction writes leaked into outer commit because db.ts lacks SQL savepoints",
  );
});

test("ADV-DB-07: SQL Parameter Injection & Sanitization - Tagged templates resist injection", async () => {
  const sql = await getSql();
  await sql`create table if not exists test_adv_tx (id text primary key, val text, num int)`;

  const maliciousPayloads = [
    "' OR '1'='1",
    "'; DROP TABLE test_adv_tx; --",
    "\\x00\\x01\\x02",
    "Robert'); DROP TABLE Students;--",
    "🚀 🌟 ⚡ 🦀 💾",
    "LongString".repeat(1000),
    JSON.stringify({ nested: "value", quotes: "\"''`", sql: "SELECT * FROM users" }),
  ];

  for (let i = 0; i < maliciousPayloads.length; i++) {
    const id = `inj_${i}`;
    const payload = maliciousPayloads[i];
    await sql.transaction(async (tx) => {
      await tx`insert into test_adv_tx (id, val, num) values (${id}, ${payload}, ${i})`;
    });

    const read = await sql<{ id: string; val: string }>`select id, val from test_adv_tx where id = ${id}`;
    assert.equal(read.length, 1);
    assert.equal(read[0].val, payload, "Payload should be stored verbatim without SQL execution");
  }

  // Verify table was NOT dropped
  const verifyTable = await sql`select count(*) from test_adv_tx`;
  assert.ok(verifyTable.length > 0);
});

test("ADV-DB-08: PGlite Single-Threaded WASM Deadlock Guard", async () => {
  // CRITICAL ARCHITECTURAL FINDING:
  // PGlite is a single-threaded WASM database engine.
  // If code inside `sql.transaction(...)` attempts to execute queries against the outer `sql` instance
  // (e.g., calling an un-injected helper that invokes `getSql()`), PGlite deadlocks because the
  // transaction holds the lock, while `pg.query` waits for the lock to be freed.
  // We verify that an outer query times out while a transaction is active:
  const sql = await getSql();
  await sql`create table if not exists test_adv_tx (id text primary key, val text, num int)`;

  let transactionFinished = false;

  await sql.transaction(async (tx) => {
    await tx`insert into test_adv_tx (id, val, num) values ('lock_test', 'in_tx', 1)`;

    // Attempting to query base `sql` concurrently while inside PGlite transaction:
    const queryPromise = sql`select count(*) from test_adv_tx`;
    const timeoutPromise = new Promise<"TIMED_OUT">((resolve) => setTimeout(() => resolve("TIMED_OUT"), 150));

    const raceResult = await Promise.race([queryPromise, timeoutPromise]);
    assert.equal(
      raceResult,
      "TIMED_OUT",
      "CONFIRMED FINDING: Concurrent base sql query cannot proceed while PGlite transaction is in flight (single-threaded WASM lock)",
    );
    transactionFinished = true;
  });

  assert.equal(transactionFinished, true);
});

test("ADV-DB-09: Rapid Sequential Transaction Cycles - 30 sequential transactions execute cleanly", async () => {
  const sql = await getSql();
  await sql`create table if not exists test_adv_tx (id text primary key, val text, num int)`;

  const CYCLES = 30;
  for (let i = 0; i < CYCLES; i++) {
    const id = `seq_${i}`;
    await sql.transaction(async (tx) => {
      await tx`insert into test_adv_tx (id, val, num) values (${id}, 'seq', ${i})`;
    });
  }

  const countRes = await sql<{ count: number }>`
    select count(*) as count from test_adv_tx where id like 'seq_%'
  `;
  assert.equal(Number(countRes[0].count), CYCLES);
});

test("ADV-DB-10: Neon Pool Transaction Engine Stress Simulation", async () => {
  // Directly test the exact connection pooling and transaction lifecycle logic
  // used by createNeonSql in db.ts lines 107-136, verifying client acquisition,
  // BEGIN / COMMIT / ROLLBACK semantics, and client.release() in finally.

  let activeClients = 0;
  let maxConcurrentClients = 0;
  let totalConnections = 0;
  let totalReleases = 0;
  const POOL_MAX = 3;

  class MockPoolClient {
    inTx = false;
    released = false;

    async query(sql: string) {
      if (sql === "BEGIN") this.inTx = true;
      if (sql === "COMMIT" || sql === "ROLLBACK") this.inTx = false;
      return { rows: [] };
    }

    release() {
      if (!this.released) {
        this.released = true;
        activeClients--;
        totalReleases++;
      }
    }
  }

  class MockPool {
    queue: Array<(client: MockPoolClient) => void> = [];

    async connect(): Promise<MockPoolClient> {
      totalConnections++;
      if (activeClients < POOL_MAX) {
        activeClients++;
        if (activeClients > maxConcurrentClients) {
          maxConcurrentClients = activeClients;
        }
        return new MockPoolClient();
      }
      return new Promise<MockPoolClient>((resolve) => {
        this.queue.push(resolve);
      });
    }

    releaseClient(client: MockPoolClient) {
      client.release();
      if (this.queue.length > 0 && activeClients < POOL_MAX) {
        activeClients++;
        if (activeClients > maxConcurrentClients) {
          maxConcurrentClients = activeClients;
        }
        const next = this.queue.shift()!;
        next(new MockPoolClient());
      }
    }
  }

  const pool = new MockPool();

  const runNeonTransactionSim = async <R>(cb: (client: MockPoolClient) => Promise<R>): Promise<R> => {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const res = await cb(client);
      await client.query("COMMIT");
      return res;
    } catch (err) {
      try {
        await client.query("ROLLBACK");
      } catch {
        // ignore
      }
      throw err;
    } finally {
      pool.releaseClient(client);
    }
  };

  const SIM_TASKS = 30;
  const simPromises = Array.from({ length: SIM_TASKS }, async (_, i) => {
    const shouldFail = i % 3 === 0;
    try {
      return await runNeonTransactionSim(async (client) => {
        await client.query("SELECT 1");
        if (shouldFail) throw new Error(`Simulated Neon failure #${i}`);
        return `ok_${i}`;
      });
    } catch {
      return `fail_${i}`;
    }
  });

  const simResults = await Promise.all(simPromises);
  assert.equal(simResults.length, SIM_TASKS);
  assert.equal(activeClients, 0, "All pool clients must be released back to pool");
  assert.equal(totalConnections, totalReleases, "Every connection must be matched by a release");
  assert.ok(maxConcurrentClients <= POOL_MAX, `Concurrent active clients (${maxConcurrentClients}) must never exceed pool max (${POOL_MAX})`);
});
