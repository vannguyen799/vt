import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const script = fileURLToPath(new URL("./session-start.mjs", import.meta.url));
const claudeRoot = "/vt-test/claude-root";
const codexRoot = "/vt-test/codex-root";

function run({ env = {}, args = [], input = {} } = {}) {
  const inheritedEnv = { ...process.env };
  delete inheritedEnv.CLAUDE_PLUGIN_ROOT;
  delete inheritedEnv.PLUGIN_ROOT;
  const result = spawnSync(process.execPath, [script, ...args], {
    env: { ...inheritedEnv, ...env },
    input: typeof input === "string" ? input : JSON.stringify(input),
    encoding: "utf8",
    timeout: 5000,
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stderr, "");
  return result.stdout;
}

test("selects runtime from explicit command or harness roots, never model provider", () => {
  const cases = [
    { name: "Claude root", env: { CLAUDE_PLUGIN_ROOT: claudeRoot }, runtime: "claude", root: claudeRoot },
    { name: "Codex root", env: { PLUGIN_ROOT: codexRoot }, runtime: "codex", root: codexRoot },
    { name: "Codex compatibility roots", env: { PLUGIN_ROOT: codexRoot, CLAUDE_PLUGIN_ROOT: claudeRoot }, runtime: "codex", root: codexRoot },
    { name: "explicit Claude wins", args: ["--runtime=claude"], env: { PLUGIN_ROOT: codexRoot, CLAUDE_PLUGIN_ROOT: claudeRoot }, runtime: "claude", root: claudeRoot },
    { name: "explicit Codex wins", args: ["--runtime=codex"], env: { CLAUDE_PLUGIN_ROOT: claudeRoot }, runtime: "codex", root: claudeRoot },
    { name: "Claude compatible fallback", args: ["--runtime=claude"], env: { PLUGIN_ROOT: codexRoot }, runtime: "claude", root: codexRoot },
  ];
  for (const entry of cases) {
    const output = run({ ...entry, input: { model: entry.runtime === "claude" ? "gpt-6" : "claude-opus-4" } });
    assert.ok(output.includes(`${entry.root}/claude/instructions/runtime-routing.md`), entry.name);
    if (entry.runtime === "codex") {
      assert.match(output, /VT Codex routing/);
      assert.match(output, /codex-model-roles\.md/);
      assert.match(output, /Preserve the user's main-session model/);
      assert.match(output, /actual available tool controls/);
      assert.doesNotMatch(output, /Fable|Opus|Sonnet|Haiku|vt-implementer|profile-performance/);
    } else {
      assert.match(output, /VT model roles/);
      assert.match(output, /Active model family is unknown; do not guess/);
    }
  }
});

test("missing roots and unrelated events produce no context", () => {
  for (const args of [[], ["--runtime=claude"], ["--runtime=codex"]]) {
    assert.equal(run({ args }), "");
  }
  for (const hook_event_name of ["Stop", "UserPromptSubmit", "", false]) {
    assert.equal(run({ env: { PLUGIN_ROOT: codexRoot }, input: { hook_event_name } }), "");
  }
  assert.equal(run({ args: ["--runtime=other"], env: { PLUGIN_ROOT: codexRoot } }), "");
});

test("malformed, null, and missing model payloads remain safe", () => {
  for (const input of ["{broken", "null", "[]", "", {}, { model: null }, { model: 12 }]) {
    const output = run({ env: { CLAUDE_PLUGIN_ROOT: claudeRoot }, input });
    assert.match(output, /Active model family is unknown; do not guess/);
    assert.match(output, /git-identity\.md/);
  }
});

test("Claude main sessions retain explicit family roles and routing", () => {
  for (const [model, role] of [
    ["claude-haiku-4", "Haiku — mechanical and I/O"],
    ["CLAUDE-SONNET-4", "Sonnet — coding and execution"],
    ["claude-opus-4", "Opus — reasoning, research"],
    ["fable-5", "Fable — orchestrator"],
  ]) {
    const output = run({ env: { CLAUDE_PLUGIN_ROOT: claudeRoot }, input: { hook_event_name: "SessionStart", model } });
    assert.ok(output.includes(`Active model family: ${role}`));
    assert.match(output, /vt-implementer/);
    assert.match(output, /model-roles\.md/);
    assert.match(output, /profile-performance\.md/);
    assert.doesNotMatch(output, /codex-model-roles/);
  }
});

test("child hooks emit bounded JSON context without recursive main-session routing", () => {
  for (const runtime of ["claude", "codex"]) {
    const output = run({
      args: [`--runtime=${runtime}`],
      env: { CLAUDE_PLUGIN_ROOT: claudeRoot, PLUGIN_ROOT: codexRoot },
      input: { hook_event_name: "SubagentStart", model: "UNTRUSTED_MODEL_OPUS", agent_type: "UNTRUSTED_AGENT_TEXT" },
    });
    const payload = JSON.parse(output);
    assert.deepEqual(Object.keys(payload), ["hookSpecificOutput"]);
    assert.equal(payload.hookSpecificOutput.hookEventName, "SubagentStart");
    const context = payload.hookSpecificOutput.additionalContext;
    assert.match(context, /bounded task/);
    assert.match(context, /caller's brief/);
    assert.match(context, /preserve your configured model and reasoning effort/);
    const root = runtime === "codex" ? codexRoot : claudeRoot;
    for (const policy of ["runtime-routing.md", runtime === "codex" ? "codex-model-roles.md" : "model-roles.md", "git-identity.md", "test-policy.md", "forge-kernel.md", "agent-docs-policy.md"]) {
      assert.ok(context.includes(`${root}/claude/instructions/${policy}`));
    }
    assert.doesNotMatch(context, /UNTRUSTED|Triggers:|vt-implementer|vt-mechanic|vt-verifier|Delegation|systemprompt|fan out/);
    if (runtime === "codex") assert.doesNotMatch(context, /Fable|Opus|Sonnet|Haiku/);
  }
});
