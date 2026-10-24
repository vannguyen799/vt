import { join } from "node:path";

async function readStdin() {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  if (!input.trim()) return {};

  try {
    const event = JSON.parse(input);
    return event && typeof event === "object" && !Array.isArray(event) ? event : {};
  } catch {
    return {};
  }
}

// The executing harness determines routing, not the provider of its selected model.
// Codex exports both root variables for compatibility, so detect its variable first.
const runtimeArgument = process.argv.slice(2).find((arg) => arg.startsWith("--runtime="));
const runtime = runtimeArgument?.slice("--runtime=".length)
  ?? (process.env.PLUGIN_ROOT ? "codex" : "claude");
if (runtime !== "claude" && runtime !== "codex") process.exit(0);
const pluginRoot = runtime === "codex"
  ? process.env.PLUGIN_ROOT || process.env.CLAUDE_PLUGIN_ROOT
  : process.env.CLAUDE_PLUGIN_ROOT || process.env.PLUGIN_ROOT;
if (!pluginRoot) process.exit(0);

const instructionsDir = join(pluginRoot, "claude", "instructions");
const ref = (name) => `\`${join(instructionsDir, name)}\``;

// Keep each policy reference in sync with its source; inject compact rules only.
const event = await readStdin();
const hookEventName = event.hook_event_name ?? "SessionStart";
if (hookEventName !== "SessionStart" && hookEventName !== "SubagentStart") process.exit(0);

const safetyRules = `Always-on rules (one line each; read the file before acting in that area):
- Git identity: commit only as the user's own \`git config\` identity, never an agent/session one; missing → ask. ${ref("git-identity.md")}
- Tests: run only what the change can affect, never the whole suite while iterating (\`/vt:test\`). ${ref("test-policy.md")}
- Forge writes (issues, comments, PRs): confirm anything others will see; no secrets. ${ref("forge-kernel.md")}
- \`CLAUDE.md\`/\`AGENTS.md\`: rules + reference index only; descriptions go to \`.claude/\`/\`.agent/\` files; never repeat another file. ${ref("agent-docs-policy.md")}`;

if (hookEventName === "SubagentStart") {
  const corePolicy = runtime === "codex" ? "codex-model-roles.md" : "model-roles.md";
  const additionalContext = `# VT child task brief (${runtime})

- Complete the bounded task and follow the caller's brief; preserve your configured model and reasoning effort.
- Runtime routing: ${ref("runtime-routing.md")} — read before runtime or model selection; core policy: ${ref(corePolicy)}.

${safetyRules}`;
  process.stdout.write(`${JSON.stringify({ hookSpecificOutput: { hookEventName, additionalContext } })}\n`);
  process.exit(0);
}

if (runtime === "codex") {
  process.stdout.write(`# VT Codex routing (compact — full policy on demand)

- Runtime routing: ${ref("runtime-routing.md")} — read before selecting a runtime or model; Codex roles and effort defaults: ${ref("codex-model-roles.md")} — read before dispatching a child.
- Preserve the user's main-session model; choose child models and reasoning effort only through the actual available tool controls and the Codex routing policy.

${safetyRules}\n`);
  process.exit(0);
}

const model = typeof event.model === "string" ? event.model.toLowerCase() : "";
let activeRole = "Active model family is unknown; do not guess a family role. Read the runtime routing policy before selecting a role.";

if (model.includes("haiku")) {
  activeRole = "Active model family: Haiku — mechanical and I/O role.";
} else if (model.includes("sonnet")) {
  activeRole = "Active model family: Sonnet — coding and execution role.";
} else if (model.includes("opus")) {
  activeRole = "Active model family: Opus — reasoning, research, and fallback orchestration role.";
} else if (model.includes("fable")) {
  activeRole = "Active model family: Fable — orchestrator role (plan and design only, never code).";
}

const brief = `# VT model roles (compact — full policy on demand)

${activeRole}

- Families: Fable orchestrates/plans · Opus reasons/researches · Sonnet codes/executes · Haiku does mechanical I/O. Own work at the lowest tier that does it well; the parent validates the result.
- Triggers: you can write the brief → \`vt-implementer\`; 2+ reads/greps/commands on one question → \`vt-mechanic\`; high-stakes result → \`vt-verifier\`; independent sub-tasks → fan out. Keep local only a small 1–2 file edit inseparable from reasoning just done.
- Runtime routing: ${ref("runtime-routing.md")} — read before selecting a runtime; full Claude roles: ${ref("model-roles.md")} + ${ref("profile-performance.md")} — read before non-trivial routing. Cost-tight variant: \`/vt:systempromptstrict\`.

${safetyRules}

Delegation is authorized only if VT's mandate reaches you through a CLAUDE.md or a skill; otherwise run \`/vt:systemprompt\` (template: ${ref("claude-md-stub.md")}).`;

process.stdout.write(`${brief}\n`);
