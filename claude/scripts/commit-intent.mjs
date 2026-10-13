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

const identityRef = process.env.CLAUDE_PLUGIN_ROOT
  ? join(process.env.CLAUDE_PLUGIN_ROOT, "claude", "instructions", "git-identity.md")
  : "claude/instructions/git-identity.md";

const event = await readStdin();
const prompt = typeof event.prompt === "string" ? event.prompt : "";

const explicitCommand = [
  /(?:^|\s)\/?vt:commit(?:\s|$)/iu,
  /(?:^|\s)\$commit(?:\s|$)/iu,
].some((pattern) => pattern.test(prompt));

const negatedIntent = [
  /\b(?:do\s+not|don't|dont|never|without)\s+(?:create\s+|make\s+)?(?:a\s+)?(?:commit|push)\b/iu,
  /\b(?:khong|không|dung|đừng|chua|chưa)\s+(?:can\s+|cần\s+)?(?:commit|push|day|đẩy)\b/iu,
].some((pattern) => pattern.test(prompt));

const actionIntent = [
  /^\s*(?:please\s+)?commit(?:\s+and\s+push)?(?:\s+(?:these?|the|my|all|current|staged|unstaged))?(?:\s+(?:changes?|files?|work|code|it|everything))?[.!]?\s*$/iu,
  /\b(?:please|then|now|and)\s+commit(?:\s+and\s+push)?\b/iu,
  /\bcommit\s+(?:and\s+push|these?|the|my|all|current|staged|unstaged|changes?|files?|work|code|it|everything)\b/iu,
  /\b(?:create|make|prepare|split|group)\s+(?:the\s+|these\s+|my\s+)?commits?\b/iu,
  /\bpush\s+(?:these?|the|my|all|current|staged|changes?|commits?|branch|code|it|everything)\b/iu,
  /\b(?:hay|hãy|roi|rồi|va|và)\s+(?:commit|push)\b/iu,
  /\b(?:tao|tạo|chia|gom|nhom|nhóm)\s+(?:cac\s+|các\s+)?commits?\b/iu,
  /\bcommit\s+(?:thay\s+doi|thay\s+đổi|thay\s+đôi|code|di|đi|lai|lại|va\s+push|và\s+push)\b/iu,
  /\b(?:day|đẩy)\s+(?:code|commit|branch|len|lên)\b/iu,
].some((pattern) => pattern.test(prompt));

const commitIntent = explicitCommand || (!negatedIntent && actionIntent);

if (!commitIntent) process.exit(0);

process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "UserPromptSubmit",
      additionalContext: `Commit intent detected. Use \`/vt:commit\` instead of improvising; it covers the safe push and the Git identity rules (${identityRef}).`,
    },
  }),
);
