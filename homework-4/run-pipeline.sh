#!/usr/bin/env bash
#
# MiniBank 4-agent pipeline — single-command orchestrator (Linux/macOS/Git-Bash).
#
#   ./run-pipeline.sh
#
# Runs the four agents headless via the Claude Code CLI, in order, each with the
# model declared in its *.agent.md frontmatter. Each agent reads its inputs,
# auto-loads its referenced skill(s), and writes its output artifact(s).
#
# Upstream steps (Bug Researcher, Bug Planner) are provided as seed context in
# context/bugs/001/ and are NOT re-run here.
#
# Requirements: `claude` CLI logged in, and `dotnet` SDK 10+ on PATH.

set -euo pipefail
cd "$(dirname "$0")"

BUG_DIR="context/bugs/001"

# Models per agent (must match each agent's frontmatter `model:`).
MODEL_VERIFIER="opus"     # claude-opus-4-8   — research fact-checking
MODEL_FIXER="haiku"       # claude-haiku-4-5  — mechanical plan execution
MODEL_SECURITY="opus"     # claude-opus-4-8   — security review
MODEL_TESTS="sonnet"      # claude-sonnet-4-6 — test generation

# Permission mode: acceptEdits lets agents write files unattended.
# For a fully hands-off run (also auto-approves bash like `dotnet test`),
# export CLAUDE_PERM="--dangerously-skip-permissions" before running.
CLAUDE_PERM="${CLAUDE_PERM:---permission-mode acceptEdits}"

# Admin key the fixed app/tests expect (kept out of source; injected at runtime).
export MINIBANK_ADMIN_API_KEY="${MINIBANK_ADMIN_API_KEY:-super-secret-admin-key-12345}"

run_agent () {
  local label="$1" model="$2" agent_file="$3"
  echo ""
  echo "==================================================================="
  echo "  AGENT: $label   (model: $model)"
  echo "  spec : $agent_file"
  echo "==================================================================="
  claude -p "$(cat "$agent_file")

---
You are running headless as the agent defined above. Steps:
1. Read every file listed under the agent's 'inputs'.
2. Load and apply every file listed under 'skills:' (read it first).
3. Perform the agent's procedure exactly.
4. Write the file(s) listed under 'outputs'.
Operate only inside this homework-4 directory. Do not touch other homework folders." \
    --model "$model" \
    $CLAUDE_PERM
}

echo "### MiniBank 4-agent pipeline ###"
echo "Run order: Research Verifier -> Bug Fixer -> Security Verifier -> Unit Test Generator"

run_agent "1/4 Bug Research Verifier" "$MODEL_VERIFIER" agents/research-verifier.agent.md
run_agent "2/4 Bug Fixer"             "$MODEL_FIXER"    agents/bug-fixer.agent.md
run_agent "3/4 Security Verifier"     "$MODEL_SECURITY" agents/security-verifier.agent.md
run_agent "4/4 Unit Test Generator"   "$MODEL_TESTS"    agents/unit-test-generator.agent.md

echo ""
echo "=== Pipeline complete — final verification build/test ==="
dotnet test --nologo

echo ""
echo "Artifacts:"
echo "  $BUG_DIR/research/verified-research.md"
echo "  $BUG_DIR/fix-summary.md"
echo "  $BUG_DIR/security-report.md"
echo "  $BUG_DIR/test-report.md"
