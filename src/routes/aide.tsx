import { createFileRoute } from "@tanstack/react-router";
import { Bot, Gauge, Loader2, Network, Send, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  askOrdinanceAide,
  getOrdinanceAgentScope,
  type OrdinanceAgentScope,
} from "@/lib/ordinance-agent";

export const Route = createFileRoute("/aide")({ component: OrdinanceAide });

type Message = { id: number; role: "assistant" | "user"; text: string };

function OrdinanceAide() {
  const [scope, setScope] = useState<OrdinanceAgentScope | null>(null);
  const [scopeError, setScopeError] = useState("");
  const [county, setCounty] = useState("York");
  const [municipality, setMunicipality] = useState("");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "Choose a county and municipality, then ask a zoning, SALDO, permitting, setback, use, or process question. I will answer from the private Field ACQ corpus and identify the source material used.",
    },
  ]);

  useEffect(() => {
    let current = true;
    void getOrdinanceAgentScope()
      .then((data) => {
        if (!current) return;
        setScope(data);
        const first = data.counties.find((item) => item.county === county)?.municipalities[0];
        setMunicipality(first ?? "");
      })
      .catch(() => {
        if (current) setScopeError("The private ordinance corpus could not be loaded.");
      });
    return () => {
      current = false;
    };
  }, []);

  const municipalities = useMemo(
    () => scope?.counties.find((item) => item.county === county)?.municipalities ?? [],
    [county, scope],
  );
  const usage = scope?.usage;
  const resetsLabel = usage
    ? new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }).format(new Date(usage.resetsAt))
    : "—";

  function changeCounty(nextCounty: string) {
    setCounty(nextCounty);
    const first = scope?.counties.find((item) => item.county === nextCounty)?.municipalities[0];
    setMunicipality(first ?? "");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const prompt = question.trim();
    if (!prompt || !municipality || busy) return;
    const id = Date.now();
    setMessages((current) => [...current, { id, role: "user", text: prompt }]);
    setQuestion("");
    setBusy(true);
    try {
      const result = await askOrdinanceAide({ data: { county, municipality, question: prompt } });
      if ("usage" in result && result.usage) {
        setScope((current) => (current ? { ...current, usage: result.usage } : current));
      }
      setMessages((current) => [
        ...current,
        {
          id: id + 1,
          role: "assistant",
          text: result.ok ? result.answer : result.error,
        },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: id + 1,
          role: "assistant",
          text: "The Ordinance Aide could not complete that request. Please try again.",
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <section className="overflow-hidden rounded-xl border border-outline-variant border-t-4 border-t-brand-lime bg-card">
        <div className="grid gap-6 px-5 py-7 md:grid-cols-[1fr_auto] md:px-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
                Field ACQ intelligence
              </p>
              <Badge variant="approved">
                <ShieldCheck className="mr-1 size-3" /> Private · Pro only
              </Badge>
            </div>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-semibold">
              <Bot className="size-8 text-primary-container" /> Ordinance Aide Agent
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Ask jurisdiction-specific questions against the private municipal corpus. Answers are
              grounded in retrieved source excerpts and call out what still needs municipal
              verification.
            </p>
          </div>
          <div className="flex min-w-48 items-center gap-3 rounded-lg bg-surface-low px-4 py-3">
            <Network className="size-8 text-secondary" />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Knowledge graph
              </div>
              <div className="font-semibold">
                {scope ? scope.documentCount.toLocaleString() : "—"} sources
              </div>
              <div className="text-xs text-muted-foreground">
                {scope ? scope.chunkCount.toLocaleString() : "—"} searchable chunks
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <label htmlFor="agent-county" className="text-sm font-semibold">
                County
              </label>
              <select
                id="agent-county"
                value={county}
                onChange={(event) => changeCounty(event.target.value)}
                disabled={!scope}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {(scope?.counties ?? []).map((item) => (
                  <option key={item.county} value={item.county}>
                    {item.county}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="agent-municipality" className="text-sm font-semibold">
                Municipality
              </label>
              <select
                id="agent-municipality"
                value={municipality}
                onChange={(event) => setMunicipality(event.target.value)}
                disabled={!scope}
                className="mt-1 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {municipalities.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            {scopeError ? <p className="text-sm text-destructive">{scopeError}</p> : null}
            <div className="rounded-md bg-surface-low p-3 text-xs text-muted-foreground">
              Source files remain private and are never exposed as a browsable website section. This
              agent returns only the excerpts needed to support an answer.
            </div>
            <div className="rounded-md border border-outline-variant p-3">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Gauge className="size-4 text-secondary" /> AI allowance
              </div>
              <p className="mt-2 text-2xl font-semibold">
                {usage ? usage.remaining.toLocaleString() : "—"}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  questions left
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {usage
                  ? `${usage.includedLimit} included monthly · resets ${resetsLabel}`
                  : "Loading allowance…"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="min-h-[560px]">
          <CardContent className="flex h-full min-h-[560px] flex-col p-0">
            <div
              className="flex-1 space-y-4 overflow-y-auto p-5"
              aria-live="polite"
              aria-label="Ordinance Aide conversation"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={
                    message.role === "user"
                      ? "ml-auto max-w-[85%] rounded-xl bg-primary-container px-4 py-3 text-sm text-on-primary"
                      : "max-w-[92%] whitespace-pre-wrap rounded-xl bg-surface-low px-4 py-3 text-sm leading-relaxed"
                  }
                >
                  {message.text}
                </div>
              ))}
              {busy ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Searching the private corpus…
                </div>
              ) : null}
            </div>
            <form onSubmit={submit} className="border-t border-outline-variant p-4">
              <Textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                maxLength={1_200}
                placeholder="Example: What setbacks and approvals should I verify for a small commercial addition?"
                className="min-h-24"
                disabled={!scope || busy || usage?.exhausted}
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">
                  Research aid only. Confirm controlling requirements with the municipality.
                </p>
                <Button
                  type="submit"
                  disabled={!scope || !municipality || !question.trim() || busy || usage?.exhausted}
                >
                  <Send className="size-4" /> Ask Aide
                </Button>
              </div>
              {usage?.exhausted ? (
                <p className="mt-2 text-sm font-medium text-destructive">
                  Monthly AI allowance used. Access resumes {resetsLabel}.
                </p>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
