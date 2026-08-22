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

const instructionsDir = join(pluginRoot, "claude", "instructions");

// The SessionStart hook injects the default (performance) profile: the shared
// core (Fable/Opus/Sonnet/Haiku roles + delegation) plus the performance
// objective, followed by the always-on Git commit identity policy. This mirrors
// `/vt:systemprompt`. The strict / cost-optimized variant (core +
// profile-strict.md) is opt-in via `/vt:systempromptstrict`.
const [event, core, profile, gitIdentity] = await Promise.all([
  readStdin(),
  readFile(join(instructionsDir, "model-roles.md"), "utf8"),
  readFile(join(instructionsDir, "profile-performance.md"), "utf8"),
  readFile(join(instructionsDir, "git-identity.md"), "utf8"),
]);

const model = typeof event.model === "string" ? event.model.toLowerCase() : "";
let activeRole = "Apply the role matching the active model family.";

if (model.includes("haiku")) {
  activeRole = "Active model family: Haiku. Follow the Haiku mechanical and I/O role below.";
} else if (model.includes("sonnet")) {
  activeRole = "Active model family: Sonnet. Follow the Sonnet execution role below.";
} else if (model.includes("opus")) {
  activeRole = "Active model family: Opus. Follow the Opus reasoning and orchestration role below.";
} else if (model.includes("fable")) {
  activeRole = "Active model family: Fable. Follow the Fable orchestration role below.";
}

const policy = `${core.trim()}\n\n---\n\n${profile.trim()}\n\n---\n\n${gitIdentity.trim()}`;
process.stdout.write(`${activeRole}\n\n${policy}\n`);
