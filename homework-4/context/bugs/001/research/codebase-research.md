# Codebase Research — Batch 001 (MiniBank)

> Produced by the **Bug Researcher** (upstream, out of pipeline scope).
> This file is the input to the **Research Verifier**. It intentionally
> contains one inaccurate claim so the verifier has a discrepancy to catch.

## Finding R1 — Unbounded overdraft in `Withdraw`

- **File**: `src/MiniBank/Bank.cs`
- **Lines**: 35–42
- **Claim**: `Withdraw` validates only that the amount is positive. It never
  compares `amount` against the account balance, so it debits the account
  regardless of available funds, allowing the balance to go negative.
- **Snippet**:

```csharp
public void Withdraw(string id, decimal amount)
{
    if (amount <= 0)
        throw new ArgumentException("Amount must be positive.", nameof(amount));

    var account = GetAccount(id);
    account.Debit(amount);
}
```

- **Impact**: `Transfer` calls `Withdraw`, so it inherits the same defect.

## Finding R2 — Incorrect simple-interest formula

- **File**: `src/MiniBank/InterestCalculator.cs`
- **Lines**: 25
- **Claim**: The bug is **integer-division truncation** — the day count is
  divided as an integer, truncating the result to zero for short periods.
- **Snippet**:

```csharp
return principal * annualRate * days;
```

- **Impact**: Interest amounts are reported incorrectly.

> NOTE: This claim is the seeded inaccuracy. See the verifier output for the
> corrected root-cause analysis.

## Finding R3 — Hardcoded admin key + insecure comparison

- **File**: `src/MiniBank/AuthService.cs`
- **Lines**: 8 (secret), 12 (comparison)
- **Claim**: The admin API key is a compile-time constant embedded in source
  control, and `Authenticate` compares the provided key with the `==` operator,
  which short-circuits on the first differing character (non-constant-time).
- **Snippet**:

```csharp
private const string AdminApiKey = "super-secret-admin-key-12345";

public bool Authenticate(string providedApiKey)
{
    return providedApiKey == AdminApiKey;
}
```

- **Impact**: Secret is exposed to anyone with repo access; comparison is
  vulnerable to timing analysis.

## Suggested remediation (high level)

- R1: reject withdrawals that exceed the balance.
- R2: divide by the number of days in a year.
- R3: move the secret to configuration/environment and use a constant-time
  comparison.
