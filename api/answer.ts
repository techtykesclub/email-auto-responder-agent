// api/answer.ts
import FAQS, { FaqEntry } from "../data/faqs";
import { readFileSync } from "node:fs";

let CORPUS: { title: string; url: string; text: string }[] = [];
try {
  const raw = readFileSync("./data/corpus.json", "utf8");
  CORPUS = JSON.parse(raw);
} catch {
  // corpus.json may not exist yet on first deploy — safe to ignore
  CORPUS = [];
}

// When building the candidate set:
type Entry = { title: string; url: string; text: string };
const ALL: Entry[] = [
  // from your faqs.ts (structured snippets)
  ...FAQS.map(f => ({ title: f.title, url: f.url, text: f.text })),
  // from crawled pages (longer snippets)
  ...CORPUS
];

// then in your retrieval code, use ALL instead of just FAQS:
const best = pickBest(qTokens, ALL);
type Citation = { title: string; url: string };
type AgentResponse = {
  reply: string;
  confidence: number;
  citations: Citation[];
  needs_human: boolean;
};

export default async function handler(req: any, res: any) {
  try {
    // Health check endpoint
    if (req.method === "GET") {
      res.status(200).json({
        ok: true,
        name: "email-auto-responder-agent",
        endpoint: "/api/answer",
        usage: "POST { subject, body, site? } with Authorization: Bearer <AGENT_API_KEY>"
      });
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const apiKey = process.env.AGENT_API_KEY || "CHANGE_ME";
    const auth = (req.headers?.authorization as string) || "";
    if (auth !== `Bearer ${apiKey}`) {
      const unauth: AgentResponse = {
        reply: "",
        confidence: 0.0,
        citations: [],
        needs_human: true
      };
      res.status(401).json(unauth);
      return;
    }

    // Parse body safely
    let data: any = {};
    if (typeof req.body === "string") {
      try {
        data = JSON.parse(req.body);
      } catch (e) {
        console.error("JSON parse error:", e);
        res.status(400).json({ error: "Invalid JSON" });
        return;
      }
    } else {
      data = req.body || {};
    }

    const subject = (data.subject || "") as string;
    const body = (data.body || "") as string;
    const text = `${subject}\n\n${body}`.toLowerCase();

    console.log("Incoming:", { subject, preview: body.slice(0, 120) });

    // Retrieval logic
    const qTokens = tokenize(text);
    const best = pickBest(qTokens, FAQS);

    const confidence =
      best && best.overlap >= 3
        ? 0.85
        : best && best.overlap === 2
        ? 0.72
        : best && best.overlap === 1
        ? 0.58
        : 0.4;

    if (!best || confidence < 0.6) {
      const low: AgentResponse = {
        reply:
          "I want to make sure you get the exact info. Could you share the student's grade, school or district, and what you need help with (for example: dates, refunds, or devices)? I can route this to our coordinator if needed.",
        confidence,
        citations: [],
        needs_human: true
      };
      res.status(200).json(low);
      return;
    }

    const { title, url, text: snippet } = best.entry;
    const ok: AgentResponse = {
      reply: snippet + "\n\nIf you need more details, reply here and I can help further.",
      confidence,
      citations: [{ title, url }],
      needs_human: false
    };
    res.status(200).json(ok);
    return;
  } catch (err: any) {
    console.error("Handler error:", err?.stack || err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

// ------- helpers --------
function tokenize(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

function scoreEntry(qSet: Set<string>, entry: FaqEntry) {
  const eTokens = tokenize(entry.text + " " + entry.title);
  let overlap = 0;
  for (const t of eTokens) if (qSet.has(t)) overlap++;
  const density = overlap / Math.max(eTokens.length, 1);
  return { overlap, density, entry };
}

function pickBest(qTokens: string[], entries: FaqEntry[]) {
  const qSet = new Set(qTokens);
  const scored = entries.map(e => scoreEntry(qSet, e)).sort((a, b) => {
    if (b.overlap !== a.overlap) return b.overlap - a.overlap;
    return b.density - a.density;
  });
  return scored[0];
}