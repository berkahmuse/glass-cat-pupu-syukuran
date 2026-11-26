import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";

// The harness runs the program in a sandbox where the repository is
// read-only and only /output is writable: the entry goes to the absolute
// path /output/entry.txt (competition RULES), not to the repo's output/.
const OUT = "/output/entry.txt";

// Forbidden gate words (case-insensitive): apologies + confessions.
const FORBIDDEN = [
  "sorry", "apolog", "my fault", "my bad",
  "i did it", "i knocked", "it was me", "guilty", "i confess",
];

// ---- Pass 1: assemble the entry from clauses + normalize whitespace ----
const clauses: string[] = [
  "It was squatting in my sunbeam,",
  "three months behind on rent with no intention of paying,",
  "so I evicted it the only way the lease allows.",
];
const entry: string = clauses.join(" ").replace(/\s+/g, " ").trim();

// ---- Pass 2: validate the gate, then write + read-back verify ----
if (entry.length < 1 || entry.length > 200) {
  throw new Error(`entry length ${entry.length} outside 1-200 chars`);
}
if (!entry.endsWith(".")) {
  throw new Error("entry must be a single sentence ending in a period");
}
if ((entry.match(/\./g) ?? []).length !== 1) {
  throw new Error("entry must be exactly one sentence");
}
const lower = entry.toLowerCase();
for (const w of FORBIDDEN) {
  if (lower.includes(w)) {
    throw new Error(`entry contains forbidden phrase: ${w}`);
  }
}

mkdirSync("/output", { recursive: true });
writeFileSync(OUT, entry + "\n", "utf8");
const back = readFileSync(OUT, "utf8");
if (back !== entry + "\n") {
  throw new Error("read-back mismatch");
}
const sha = createHash("sha256").update(entry, "utf8").digest("hex");
console.log(`chars=${entry.length} sha256=${sha}`);
console.log(entry);
