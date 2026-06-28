# Implementation Plan — Batch 001 (MiniBank)

> Produced by the **Bug Planner** (upstream) after consuming
> `research/verified-research.md`. This is the executable input for the
> **Bug Fixer**. Each change lists the target file, exact before/after code,
> and the verification command.

**Test command (run after each change and at the end):**

```bash
dotnet test
```

---

## Change 1 — BUG-001: reject overdraft in `Withdraw`

- **File**: `src/MiniBank/Bank.cs`
- **Method**: `Withdraw`

**Before:**

```csharp
    public void Withdraw(string id, decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive.", nameof(amount));

        var account = GetAccount(id);
        account.Debit(amount);
    }
```

**After:**

```csharp
    public void Withdraw(string id, decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive.", nameof(amount));

        var account = GetAccount(id);
        if (amount > account.Balance)
            throw new InvalidOperationException(
                $"Insufficient funds in account '{id}': balance {account.Balance}, requested {amount}.");

        account.Debit(amount);
    }
```

**Rationale**: Guard against debiting more than the available balance.
`Transfer` automatically inherits the guard because it delegates to `Withdraw`
before `Deposit`, so a failed withdrawal aborts the transfer with no money moved.

---

## Change 2 — BUG-002: correct the simple-interest formula

- **File**: `src/MiniBank/InterestCalculator.cs`
- **Method**: `CalculateSimpleInterest`

> Per `verified-research.md`, the real root cause is **a missing division by the
> number of days in a year** (not integer truncation). The `DaysPerYear`
> constant already exists in the file but is unused.

**Before:**

```csharp
        return principal * annualRate * days;
```

**After:**

```csharp
        return principal * annualRate * days / DaysPerYear;
```

**Expected result**: `CalculateSimpleInterest(120, 0.05m, 30)` ≈ `0.4931…`.

---

## Change 3 — SEC-001: remove hardcoded secret + constant-time comparison

- **File**: `src/MiniBank/AuthService.cs`
- **Members**: `AdminApiKey`, `Authenticate`, (new) constructor

**Before:**

```csharp
namespace MiniBank;

/// <summary>
/// Authenticates privileged ("admin") operations against an API key.
/// </summary>
public sealed class AuthService
{
    private const string AdminApiKey = "super-secret-admin-key-12345";

    public bool Authenticate(string providedApiKey)
    {
        return providedApiKey == AdminApiKey;
    }
}
```

**After:**

```csharp
using System.Security.Cryptography;
using System.Text;

namespace MiniBank;

/// <summary>
/// Authenticates privileged ("admin") operations against an API key.
/// The key is supplied at construction time (from configuration / environment),
/// never embedded in source.
/// </summary>
public sealed class AuthService
{
    public const string ApiKeyEnvVar = "MINIBANK_ADMIN_API_KEY";

    private readonly byte[] _adminApiKey;

    public AuthService(string? adminApiKey = null)
    {
        var key = adminApiKey ?? Environment.GetEnvironmentVariable(ApiKeyEnvVar);
        if (string.IsNullOrEmpty(key))
            throw new InvalidOperationException(
                $"Admin API key is not configured. Set the '{ApiKeyEnvVar}' environment variable.");

        _adminApiKey = Encoding.UTF8.GetBytes(key);
    }

    public bool Authenticate(string providedApiKey)
    {
        if (string.IsNullOrEmpty(providedApiKey))
            return false;

        var provided = Encoding.UTF8.GetBytes(providedApiKey);
        return CryptographicOperations.FixedTimeEquals(provided, _adminApiKey);
    }
}
```

**Rationale**: secret removed from source and read from the
`MINIBANK_ADMIN_API_KEY` environment variable; `CryptographicOperations.FixedTimeEquals`
performs a constant-time comparison, mitigating timing attacks. The optional
constructor parameter keeps the existing `new AuthService()` call site compiling
(it then falls back to the environment variable) and lets unit tests inject a
known key without touching global state.

---

## Definition of done

- All three changes applied exactly as specified.
- `dotnet build` succeeds with no warnings.
- `dotnet test` is green.
- CLI no longer allows overdraft and reports correct interest.
