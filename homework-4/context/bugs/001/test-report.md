# Test Report — Batch 001 (MiniBank)

> Produced by the **Unit Test Generator** agent (`agents/unit-test-generator.agent.md`).
> Skill applied: **`skills/unit-tests-FIRST.md`**. Scope: only the methods changed
> in `fix-summary.md`.

## Tests Generated

| File | Test | Covers |
|------|------|--------|
| `tests/MiniBank.Tests/BankTests.cs` | `Withdraw_AmountEqualsBalance_DrainsToZero` | BUG-001 boundary: exact-balance withdrawal allowed |
| | `Withdraw_AmountExceedsBalance_ThrowsAndLeavesBalanceUnchanged` | BUG-001 fix: overdraft rejected, balance intact |
| | `Withdraw_NonPositiveAmount_Throws` (Theory ×2) | existing guard `amount <= 0` |
| | `Transfer_InsufficientFunds_MovesNoMoney` | BUG-001 fix propagates to `Transfer` (atomic) |
| | `Transfer_SufficientFunds_MovesMoney` | happy-path money movement |
| `tests/MiniBank.Tests/InterestCalculatorTests.cs` | `CalculateSimpleInterest_KnownInputs_ReturnsExpected` (Theory ×3) | BUG-002 fix: correct `/365` formula |
| | `CalculateSimpleInterest_IsNotInflated_RegressionForBug002` | regression guard vs. the old inflated value (180 → 0.49) |
| | `CalculateSimpleInterest_NegativeArguments_Throw` (Theory ×3) | argument guards |
| `tests/MiniBank.Tests/AuthServiceTests.cs` | `Authenticate_CorrectKey_ReturnsTrue` | SEC-001 fix: valid key accepted |
| | `Authenticate_WrongKey_ReturnsFalse` | wrong key rejected (constant-time path) |
| | `Authenticate_NullOrEmptyProvidedKey_ReturnsFalse` (Theory ×2) | empty/null input guard |
| | `Constructor_EmptyKey_Throws` | fail-fast when key unconfigured |

## Run Result

```
dotnet test
Passed!  - Failed: 0, Passed: 18, Skipped: 0, Total: 18, Duration: 21 ms - MiniBank.Tests.dll (net10.0)
```

- **Total**: 18 · **Passed**: 18 · **Failed**: 0 · **Skipped**: 0
- **Duration**: 21 ms

## FIRST Self-Check

- **F (Fast)** — pure in-memory objects, no I/O / network / sleeps; whole suite = **21 ms**.
- **I (Independent)** — every test constructs its own `Bank` / `AuthService`; no shared mutable state; order-independent.
- **R (Repeatable)** — no `DateTime.Now`, no randomness; the auth key is **injected via constructor**, so tests never read or mutate the real `MINIBANK_ADMIN_API_KEY` env var.
- **S (Self-validating)** — every test ends in `Assert`; 18 tests, ≥1 assertion each (boundary tests assert both the throw and the unchanged state).
- **T (Timely)** — tests map 1:1 to the three changed units in `fix-summary.md`; no tests added for untouched code.

## Coverage Notes

| Changed method (from fix-summary) | Covered by |
|-----------------------------------|------------|
| `Bank.Withdraw` | BankTests (exact / over / non-positive) |
| `Bank.Transfer` | BankTests (insufficient / sufficient) |
| `InterestCalculator.CalculateSimpleInterest` | InterestCalculatorTests (known / regression / guards) |
| `AuthService` ctor + `Authenticate` | AuthServiceTests (valid / wrong / empty / unconfigured) |

## References

- Tests: `tests/MiniBank.Tests/{BankTests,InterestCalculatorTests,AuthServiceTests}.cs`
- Source under test: `src/MiniBank/{Bank,InterestCalculator,AuthService}.cs`
- Input: `context/bugs/001/fix-summary.md`
- Skill: `skills/unit-tests-FIRST.md`
