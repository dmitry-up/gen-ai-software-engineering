# Fix Summary — Batch 001 (MiniBank)

> Produced by the **Bug Fixer** agent (`agents/bug-fixer.agent.md`).
> Executed `context/bugs/001/implementation-plan.md`. Test command: `dotnet test`.

## Changes Made

### Change 1 — BUG-001: reject overdraft in `Withdraw`

- **File**: `src/MiniBank/Bank.cs`
- **Location**: `Withdraw` (lines ~35–46 after edit)

**Before:**
```csharp
        var account = GetAccount(id);
        account.Debit(amount);
```

**After:**
```csharp
        var account = GetAccount(id);
        if (amount > account.Balance)
            throw new InvalidOperationException(
                $"Insufficient funds in account '{id}': balance {account.Balance}, requested {amount}.");

        account.Debit(amount);
```

- **Test result after change**: build OK, `dotnet test` green (0 failures).

### Change 2 — BUG-002: correct simple-interest formula

- **File**: `src/MiniBank/InterestCalculator.cs`
- **Location**: `CalculateSimpleInterest` return (line 25)

**Before:**
```csharp
        return principal * annualRate * days;
```

**After:**
```csharp
        return principal * annualRate * days / DaysPerYear;
```

- **Test result after change**: build OK, `dotnet test` green.

### Change 3 — SEC-001: remove hardcoded secret + constant-time comparison

- **File**: `src/MiniBank/AuthService.cs`
- **Location**: whole class (secret removed; constructor added; `Authenticate` rewritten)

**Before:**
```csharp
    private const string AdminApiKey = "super-secret-admin-key-12345";

    public bool Authenticate(string providedApiKey)
    {
        return providedApiKey == AdminApiKey;
    }
```

**After:**
```csharp
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
```

- **Collateral edit**: `src/MiniBank.Cli/Program.cs` wraps `new AuthService()` in a
  try/catch so the demo degrades gracefully when the env var is unset (the
  service now requires configured key material). No behavioural change to the
  library API beyond the documented constructor.
- **Test result after change**: build OK, `dotnet test` green.

## Overall Status

✅ **PASS** — all three changes applied as planned.

- `dotnet build`: succeeded, **0 warnings, 0 errors**.
- `dotnet test`: succeeded (at fix time the test project had no tests yet; the
  Unit Test Generator adds the regression suite next — see `test-report.md`).

## Manual Verification

```bash
# Fixed behaviour (run from homework-4/):
export MINIBANK_ADMIN_API_KEY="super-secret-admin-key-12345"   # PowerShell: $env:MINIBANK_ADMIN_API_KEY="..."
dotnet run --project src/MiniBank.Cli
```

Expected output (vs. the buggy "before"):

| Line | Before (buggy) | After (fixed) |
|------|----------------|---------------|
| Overdraft | `ACC-2 after -1000 withdraw: -970,00 ₴` | `Overdraft correctly rejected: Insufficient funds …` |
| Interest | `30-day simple interest on ACC-1 @5%: 180,00 ₴` | `30-day simple interest on ACC-1 @5%: 0,49 ₴` |
| Admin auth | key hardcoded in source | `Admin authenticated: True` (key from env) |

## References / Changed Files

- `src/MiniBank/Bank.cs` — `Withdraw`
- `src/MiniBank/InterestCalculator.cs` — `CalculateSimpleInterest`
- `src/MiniBank/AuthService.cs` — class rewritten
- `src/MiniBank.Cli/Program.cs` — defensive try/catch around auth demo
