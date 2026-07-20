import { readFile } from "node:fs/promises";
import { join } from "node:path";

async function readStdin() {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  if (!input.trim()) return {};

  try {
    return JSON.parse(input);
  } catch {
    return {};
  }
}

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT;
if (!pluginRoot) process.exit(0);

const [event, policy] = await Promise.all([
  readStdin(),
  readFile(join(pluginRoot, "claude", "instructions", "model-roles.md"), "utf8"),
]);

const model = typeof event.model === "string" ? event.model.toLowerCase() : "";
let activeRole = "Apply the role matching the active model family.";

if (model.includes("sonnet")) {
  activeRole = "Active model family: Sonnet. Follow the Sonnet execution role below.";
} else if (model.includes("opus")) {
  activeRole = "Active model family: Opus. Follow the Opus reasoning and orchestration role below.";
} else if (model.includes("fable")) {
  activeRole = "Active model family: Fable. Follow the Fable orchestration role below.";
}

process.stdout.write(`${activeRole}\n\n${policy.trim()}\n`);
