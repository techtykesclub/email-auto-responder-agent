// scripts/crawl.ts (run with: npx tsx scripts/crawl.ts)
// Crawls a small whitelist and writes data/corpus.json (title, url, text snippet).

import { readFile, writeFile } from "node:fs/promises";
import { parse } from "node-html-parser";

// Node 20 global fetch is available; no extra dep needed.

async function main() {
  const raw = await readFile("data/urls.txt", "utf8");
  const urls = raw.split("\n").map(s => s.trim()).filter(Boolean);
  const entries: { title: string; url: string; text: string }[] = [];

  for (const url of urls) {
    const res = await fetch(url, { headers: { "User-Agent": "TechTykesBot/1.0 (+contact@techtkyes.com)" }});
    if (!res.ok) {
      console.error(`Fetch failed ${res.status} for ${url}`);
      continue;
    }
    const html = await res.text();
    const root = parse(html);

    // Remove common boilerplate; customize for your site if needed
    root.querySelectorAll("script,style,nav,footer,header,noscript").forEach(n => n.remove());

    // Basic readability: collapse whitespace
    const text = root.text.replace(/\s+/g, " ").trim();
    const title = (root.querySelector("title")?.text || url).trim();

    // Cap text size to keep the repo small and retrieval fast
    const snippet = text.slice(0, 8000); // 8k chars per page max
    entries.push({ title, url, text: snippet });
    console.log(`✓ Crawled: ${url} (${snippet.length} chars)`);
  }

  await writeFile("data/corpus.json", JSON.stringify(entries, null, 2));
  console.log(`Wrote data/corpus.json with ${entries.length} pages`);
}

main().catch(err => {
  console.error("crawl.ts failed:", err);
  process.exit(1);
});