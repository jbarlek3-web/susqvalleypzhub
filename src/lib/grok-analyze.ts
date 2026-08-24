import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  address: z.string().max(120),
  municipality: z.string().max(80),
  county: z.string().max(40),
  zoning: z.string().max(12),
  acres: z.number(),
  constraints: z.array(z.string().max(80)).max(8),
  question: z.string().max(400).optional(),
});

export const analyzeParcel = createServerFn({ method: "POST" })
  .validator((input: unknown) => Input.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "AI is not available in this environment." };

    const prompt = `You are a senior Pennsylvania land-use analyst for the Susquehanna Valley (York, Cumberland, Dauphin, Lancaster). Be concise, practical, and cite typical MPC / municipal practice. Do not invent parcel-specific ordinance text as if quoted.

Parcel: ${data.address}, ${data.municipality}, ${data.county} County
Zoning: ${data.zoning}
Acreage: ${data.acres}
Known constraints: ${data.constraints.join(", ") || "none listed"}
Planner question: ${data.question || "Give a development feasibility brief."}

Return:
1. Feasibility snapshot (3–5 sentences)
2. Likely process (sketch, SALDO, ZHB if needed)
3. Top 3 diligence items
4. One risk to flag`;

    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        max_tokens: 700,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!res.ok) return { ok: false as const, error: `xAI API error ${res.status}` };
    const body = (await res.json()) as {
      choices: { message: { content: string } }[];
    };
    return { ok: true as const, text: body.choices[0]?.message.content ?? "" };
  });
