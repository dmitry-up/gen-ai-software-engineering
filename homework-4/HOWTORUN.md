# ▶️ How to Run — Homework 4 (MiniBank 4-Agent Pipeline)

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| .NET SDK | 10.0+ | `dotnet --version` |
| Claude Code CLI | 2.x, logged in | `claude --version` |
| PowerShell 7+ (Windows) or Bash | — | `pwsh --version` / `bash --version` |

> All commands below run from the `homework-4/` directory.

---

## 1. Run the sample app (MiniBank)

The fixed `AuthService` reads the admin key from an environment variable
(no secret in source). Set it first:

```bash
# Linux / macOS / Git-Bash
export MINIBANK_ADMIN_API_KEY="super-secret-admin-key-12345"
dotnet run --project src/MiniBank.Cli
```

```powershell
# Windows PowerShell
$env:MINIBANK_ADMIN_API_KEY = "super-secret-admin-key-12345"
dotnet run --project src/MiniBank.Cli
```

Expected (fixed) output:

```
=== MiniBank demo ===
ACC-1 opening balance: 100,00 ₴
ACC-1 after +50 deposit: 150,00 ₴
ACC-1 after -30 transfer: 120,00 ₴
ACC-2 after +30 transfer: 30,00 ₴
Overdraft correctly rejected: Insufficient funds in account 'ACC-2': balance 30, requested 1000.
30-day simple interest on ACC-1 @5%: 0,49 ₴
Admin authenticated: True
```

> (Money is formatted in the machine's current culture — `₴`/`$`/`€` may differ.)

---

## 2. Run the tests

```bash
dotnet test
```

Expected:

```
Passed!  - Failed: 0, Passed: 18, Skipped: 0, Total: 18 - MiniBank.Tests.dll (net10.0)
```

---

## 3. Run the full 4-agent pipeline (single command)

```bash
# Linux / macOS / Git-Bash
./run-pipeline.sh
```

```powershell
# Windows PowerShell 7+
pwsh ./run-pipeline.ps1
```

What it does, in order, each with the model from the agent's frontmatter:

1. **Research Verifier** (opus) → `context/bugs/001/research/verified-research.md`
2. **Bug Fixer** (haiku) → applies `implementation-plan.md`, writes `fix-summary.md`
3. **Security Verifier** (opus) → `context/bugs/001/security-report.md`
4. **Unit Test Generator** (sonnet) → tests + `context/bugs/001/test-report.md`

Then it runs `dotnet test` as a final check.

### Permissions

By default the script uses `--permission-mode acceptEdits` so agents can write
files unattended. For a fully hands-off run (also auto-approves `dotnet test`):

```bash
CLAUDE_PERM="--dangerously-skip-permissions" ./run-pipeline.sh
```

```powershell
$env:CLAUDE_PERM = "--dangerously-skip-permissions"; pwsh ./run-pipeline.ps1
```

> **Note**: the artifacts are already committed in `context/bugs/001/`, so you can
> review the pipeline's results without re-running it. Re-running against the
> already-fixed source will have the Bug Fixer report "changes already applied".
> To watch it fix from scratch, `git stash` / revert the `src/MiniBank/*` edits
> first (see `fix-summary.md` for the exact before/after).

---

## 4. Where to look

| Want to see… | Open |
|--------------|------|
| The seeded bugs | `context/bugs/001/bug-context.md` |
| Research verification + quality grade | `context/bugs/001/research/verified-research.md` |
| What was fixed | `context/bugs/001/fix-summary.md` |
| Security review | `context/bugs/001/security-report.md` |
| Test results + FIRST check | `context/bugs/001/test-report.md` |
| Agent definitions & models | `agents/*.agent.md` |
| Skills | `skills/*.md` |
