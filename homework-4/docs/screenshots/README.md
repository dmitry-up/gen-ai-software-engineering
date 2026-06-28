# Screenshots

Evidence captured from real runs of the MiniBank app, test suite, and the agent
pipeline. Embedded in the PR description.

| File | What it shows |
|------|---------------|
| `01-pipeline-run.png` | `pwsh ./run-pipeline.ps1` — the four agents in order (opus / haiku) and the final `dotnet test` summary. |
| `02-before-bugs.png` | Buggy CLI output: overdraft `-970,00 ₴` (BUG-001), interest `180,00 ₴` (BUG-002). |
| `03-after-fixes.png` | Fixed CLI output: overdraft rejected, interest `0,49 ₴`, `Admin authenticated: True`. |
| `04-security-scan.png` | Security Verifier (opus) output — SEC-001 RESOLVED, residual findings rated. |
| `05-unit-tests.png` | `dotnet test` — `Passed! Failed: 0, Passed: 18, Total: 18`. |
| `06-ai-interaction.png` | A live `claude -p` agent invocation (Security Verifier) and its response. |

The CLI/test screenshots are captured verbatim from `dotnet run` / `dotnet test`
(the "before" image was taken with the fixes temporarily reverted). The security
and AI-interaction screenshots are from a live `claude -p` run of the Security
Verifier agent. `01-pipeline-run.png` summarises the orchestrator banner and the
committed artifact outcomes; run `./run-pipeline.sh` / `pwsh ./run-pipeline.ps1`
to reproduce the full four-agent transcript end to end.
