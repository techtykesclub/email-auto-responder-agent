// api/answer.ts
import FAQS, { FaqEntry } from "../data/faqs";

type Citation = { title: string; url: string };
type AgentResponse = {
  reply: string;
  confidence: number;
  citations: Citation[];
  needs_human: boolean;
};

// Vercel compiles TS; keep it ASCII only.
export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.AGENT_API_KEY || "CHANGE_ME";
  const auth = (req.headers?.authorization as string) || "";
  if (auth !== `Bearer ${apiKey}`) {
    const unauth: AgentResponse = { reply: "", confidence: 0.0, citations: [], needs_human: true };
    return res.status(401).json(unauth);
  }

  // Body parse (Vercel may give parsed JSON already)
  let data: any = {};
  try {
    data = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  const subject = (data.subject || "") as string;
  const body = (data.body || "") as string;
  const text = `${subject}\n\n${body}`.toLowerCase();

  // ------------- Intent or retrieval -------------
  // simple token overlap retrieval over FAQS
  const qTokens = tokenize(text);
  const best = pickBest(qTokens, FAQS);

  const confidence =
    best && best.overlap >= 3 ? 0.85 :
    best && best.overlap === 2 ? 0.72 :
    best && best.overlap === 1 ? 0.58 : 0.4;

  if (!best || confidence < 0.6) {
    const low: AgentResponse = {
      reply:
        "I want to give you the exact info. Please share the student's grade, school or district, " +
        "and what you need help with (for example: dates, refunds, devices). I can loop in our coordinator if needed.",
      confidence,
      citations: [],
      needs_human: true
    };
    return res.status(200).json(low);
  }

  const { title, url, text: snippet } = best.entry;
  const ok: AgentResponse = {
    reply: formatForParents(snippet),
    confidence,
    citations: [{ title, url }],
    needs_human: false
  };
  return res.status(200).json(ok);
}

// -------- helpers --------
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

function formatForParents(snippet: string): string {
  // Keep answers short and concrete for email.
  return snippet + "\n\nIf you need more details, reply here and I can help further.";
}