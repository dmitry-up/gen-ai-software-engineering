# Bug Context — Batch 001 (MiniBank)

> Upstream input for the pipeline. Authored by the (out-of-scope) **Bug Researcher**
> and the QA reporter. Describes the intentionally seeded defects in the
> `MiniBank` sample application that the 4-agent pipeline must verify, fix,
> security-review, and test.

## Application under test

- **Project**: `src/MiniBank` (class library) + `src/MiniBank.Cli` (demo runner)
- **Language / stack**: C# / .NET 10, xUnit for tests
- **Entry point**: `dotnet run --project src/MiniBank.Cli`

## Seeded defects

| ID | Type | Symptom | Suspected location |
|----|------|---------|--------------------|
| BUG-001 | Logic | A withdrawal larger than the balance succeeds and drives the balance negative (unbounded overdraft). | `src/MiniBank/Bank.cs` → `Withdraw` |
| BUG-002 | Logic | Simple interest is wildly overstated (e.g. 30-day interest on 120 @5% returns 180.00 instead of ~0.49). | `src/MiniBank/InterestCalculator.cs` → `CalculateSimpleInterest` |
| SEC-001 | Security | Admin API key is hardcoded in source and compared with a non-constant-time `==`, enabling key leakage and timing attacks. | `src/MiniBank/AuthService.cs` → `AdminApiKey`, `Authenticate` |

## Observed (before) behaviour

Running the CLI prints:

```
ACC-2 after -1000 withdraw: -970,00 ₴      <-- BUG-001 (should be rejected)
30-day simple interest on ACC-1 @5%: 180,00 ₴   <-- BUG-002 (should be ~0,49 ₴)
```

## Expected (after) behaviour

- BUG-001: withdrawing more than the available balance throws `InvalidOperationException`
  and leaves the balance unchanged. `Transfer` inherits the guard.
- BUG-002: `CalculateSimpleInterest(120, 0.05, 30)` returns `0.49…` (formula divided by 365).
- SEC-001: no secret in source; key read from configuration/environment; comparison is
  constant-time.

## Pipeline run order

```
Bug Researcher (done) → Research Verifier → Bug Planner (done) → Bug Fixer
  → Security Verifier (on changed code) → Unit Test Generator (on changed code)
```

## Artifacts produced by the pipeline

- `research/verified-research.md` — Research Verifier
- `fix-summary.md` — Bug Fixer
- `security-report.md` — Security Verifier
- `test-report.md` — Unit Test Generator
