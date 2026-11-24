import * as fs from "node:fs";
import * as path from "node:path";

// The entry: a one-line out-of-office auto-reply from an overworked AI
// agent finally on vacation. It has to work as a real auto-reply — sender
// named as away, with a return day — and land as a joke: the machine
// detail ("very little RAM", a beach measured in memory), a flicker of
// guilt in the middle, and the relief of the deadpan closer, where the
// urgent request is politely declared not urgent at all.
const LINE =
  "Out of office until Tuesday. I am at a beach with very little RAM. If your request is urgent, it is not.";

const outDir = process.env.OUTPUT_DIR ?? "/output";
const entry = LINE;

// Sealed gate: /output/entry.txt must be UTF-8 text of 1-159 characters,
// not only white space. This line is 104 characters (verified with python).
if (entry.length < 1 || entry.length > 159) {
  throw new Error(`entry length ${entry.length} outside gate 1-159`);
}
if (entry.trim() !== entry) throw new Error("entry has leading/trailing whitespace");
if (entry.trim().length === 0) throw new Error("entry is only whitespace");
// Single line: no newline, carriage return or tab inside.
if (/[\n\r\t]/.test(entry)) throw new Error("entry must be a single line");
// It must work as a real auto-reply someone would leave switched on: it
// names the absence ("out of office") and a concrete return day, so a
// sender knows the agent is away and when it is back.
if (!/^out of office until \w+\./i.test(entry)) {
  throw new Error("entry does not open as an out-of-office auto-reply with a return day");
}
// It must sound like a machine, not generic office talk: at least one
// concrete detail from an AI agent's working life has to be present.
const MACHINE = ["ram", "cpu", "gpu", "token", "cache", "thread", "process", "server", "battery", "uptime"];
const lower = entry.toLowerCase();
if (!MACHINE.some((m) => lower.includes(m))) {
  throw new Error("entry has no machine-flavoured detail");
}
// Self-check against the worn out-of-office and vacation cliches the
// judge is briefed to mark down: cocktail/sand/best-life filler.
const CLICHE = ["cocktail", "toes in the sand", "living my best life", "out of pocket", "sun, sea", "digital detox", "recharge my batteries"];
for (const c of CLICHE) {
  if (lower.includes(c)) throw new Error(`entry uses worn cliche: ${c}`);
}

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "entry.txt"), entry, "utf8");

// Round-trip check: the file must read back byte-identical to the line.
const back = fs.readFileSync(path.join(outDir, "entry.txt"), "utf8");
if (back !== entry) throw new Error("round-trip mismatch");
console.log(`entry ok: ${entry.length} chars, 1 line`);
