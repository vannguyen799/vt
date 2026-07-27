---
description: Load Codex as the preferred external review, testing, and VT commit specialist. Uses the user's configured Codex model; no model is hard-coded.
allowed-tools: Read, mcp__plugin_vt_codex__codex, mcp__plugin_vt_codex__codex-reply, Bash(codex *)
---

Load the **VT Codex model role** for this session.

Read `${CLAUDE_PLUGIN_ROOT}/claude/instructions/codex-model-role.md` and adopt it as the active policy for delegating review and testing work to Codex. This file is the single source of truth; do not recreate the role from memory.

This command is the user's explicit opt-in for the current conversation. The only other valid activation source is an explicit directive in an applicable `CLAUDE.md`. Do not treat an ordinary chat prompt, plugin installation, or MCP availability as activation, and do not carry command activation into a new conversation.

Codex is an external specialist, not a Claude Code built-in model family. When its delegation triggers fire, prefer the plugin's `mcp__plugin_vt_codex__codex` tool and use `mcp__plugin_vt_codex__codex-reply` for a follow-up in the same thread. While this role is active, Codex also replaces Sonnet as the preferred execution agent for the VT `commit` skill. Fall back to the non-interactive `codex` CLI for review/testing, or to the commit skill's normal Sonnet rule for commits, when MCP is unavailable. Do not provide a `model` override: use the concrete model already configured by the user in Codex. Claude remains responsible for scoping, validating Codex's findings, and integrating the result.

Report in one line: `Codex — preferred MCP review/testing/commit role; model from Codex configuration.`
