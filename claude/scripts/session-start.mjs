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
const ref = (name) => `\`${join(instructionsDir, name)}\``;

// The SessionStart hook injects a compact brief — active role, sub-agent table,
// the triggers that fire most, and one line per always-on safety rule — and
// points at the full files instead of inlining them. The full policy (core +
// profile + git identity + forge kernel) costs ~12KB on every session; the
// model reads it on demand, or the user loads it with `/vt:systemprompt`
// (performance) or `/vt:systempromptstrict` (cost). Keep this brief in sync
// with model-roles.md, git-identity.md, forge-kernel.md, test-policy.md, and agent-docs-policy.md.
const event = await readStdin();

const model = typeof event.model === "string" ? event.model.toLowerCase() : "";
let activeRole = "Apply the role matching the active model family.";

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
- Full roles and routing: ${ref("model-roles.md")} + ${ref("profile-performance.md")} — read before non-trivial routing. Cost-tight variant: \`/vt:systempromptstrict\`.

Always-on rules (one line each; read the file before acting in that area):
- Git identity: commit only as the user's own \`git config\` identity, never an agent/session one; missing → ask. ${ref("git-identity.md")}
- Tests: run only what the change can affect, never the whole suite while iterating (\`/vt:test\`). ${ref("test-policy.md")}
- Forge writes (issues, comments, PRs): confirm anything others will see; no secrets. ${ref("forge-kernel.md")}
- \`CLAUDE.md\`/\`AGENTS.md\`: rules + reference index only; descriptions go to \`.claude/\`/\`.agent/\` files; never repeat another file. ${ref("agent-docs-policy.md")}

Delegation is authorized only if VT's mandate reaches you through a CLAUDE.md or a skill; otherwise run \`/vt:systemprompt\` (template: ${ref("claude-md-stub.md")}).`;

process.stdout.write(`${brief}\n`);
