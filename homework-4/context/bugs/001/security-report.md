# Security Report — Batch 001 (MiniBank)

> Produced by the **Security Vulnerabilities Verifier** agent
> (`agents/security-verifier.agent.md`). Report-only — no code was modified.
> Scope: the code changed in batch 001 per `context/bugs/001/fix-summary.md`,
> plus directly reachable code.

## Summary

Overall posture: **Good**. The batch's headline security item, **SEC-001**
(hardcoded admin API key + non-constant-time comparison), is **resolved** in the
changed code: the literal secret is gone, key material is injected at construction
time, and the comparison now uses `CryptographicOperations.FixedTimeEquals`.

No injection, command, or path-traversal surfaces exist in the changed code
(no SQL, no shell, no filesystem, no deserialization). No web surface is present,
so XSS/CSRF are **N/A**. All inbound numeric/string inputs in the changed paths
are guard-validated.

Findings by severity:

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH     | 0 |
| MEDIUM   | 0 |
| LOW      | 2 |
| INFO     | 3 (incl. 1 "resolved" confirmation) |

## SEC-001 verdict — RESOLVED ✅

`src/MiniBank/AuthService.cs`

- **Hardcoded secret removed** — the previous `private const string AdminApiKey =
  "super-secret-admin-key-12345";` is gone. The key is now read from the
  `MINIBANK_ADMIN_API_KEY` environment variable (or an explicit constructor
  argument), and construction fails fast with `InvalidOperationException` if no
  key is configured (`AuthService.cs:17-25`). This aligns with "no secrets in
  source code / config".
- **Constant-time comparison** — `Authenticate` now compares with
  `CryptographicOperations.FixedTimeEquals` instead of the data-dependent `==`
  string compare (`AuthService.cs:33`). The previous timing side-channel on the
  secret comparison is eliminated.
- **Empty-input handling** — null/empty provided keys short-circuit to `false`
  (`AuthService.cs:29`) without touching the secret.

Both halves of SEC-001 are correctly remediated. Tracked below as INFO/resolved.

## Findings

### INFO-001 — SEC-001 confirmed resolved (hardcoded key + timing-safe compare)
- **Severity**: INFO (resolved)
- **Location**: `src/MiniBank/AuthService.cs:13-34`
- **Description**: Hardcoded admin key removed; key injected via env var /
  constructor; comparison uses `CryptographicOperations.FixedTimeEquals`.
- **Remediation**: None required. Keep the key out of source and config; ensure
  the deployment environment provisions `MINIBANK_ADMIN_API_KEY` via a secret
  manager rather than a plaintext file or shell history.

### LOW-001 — Secret length oracle via `FixedTimeEquals`
- **Severity**: LOW
- **Location**: `src/MiniBank/AuthService.cs:32-33`
- **Description**: `FixedTimeEquals` is constant-time only across equal-length
  inputs; it returns `false` immediately when the two byte arrays differ in
  length. Because `provided` is the raw UTF-8 of the caller-supplied key, an
  attacker can still learn the **byte length** of the configured admin key by
  observing which inputs take the (marginally different) equal-length path. This
  is a weak oracle — it narrows brute-force space but does not reveal key bytes —
  hence LOW, not HIGH.
- **Remediation**: Compare fixed-length values instead of raw key bytes — e.g.
  hash both sides to a fixed size before comparing:
  `FixedTimeEquals(SHA256.HashData(provided), SHA256.HashData(_adminApiKey))`.
  This makes both operands always 32 bytes and removes the length signal.

### LOW-002 — Secret key material retained as a non-zeroed in-memory byte array
- **Severity**: LOW
- **Location**: `src/MiniBank/AuthService.cs:15,24`
- **Description**: The admin key is stored for the object's lifetime in
  `_adminApiKey` (a `byte[]` from `Encoding.UTF8.GetBytes`). It is never cleared,
  so the secret lingers on the managed heap and may surface in a memory/crash
  dump. Minor for an in-memory demo, but a real consideration if this class is
  reused in a longer-lived service.
- **Remediation**: For higher assurance, avoid holding the raw key — store a
  salted hash and compare hashes, or clear the byte buffer with
  `CryptographicOperations.ZeroMemory` once consumed. Acceptable to defer for the
  current scope; document the decision.

### INFO-002 — Plaintext secret echoed in pipeline documentation
- **Severity**: INFO
- **Location**: `context/bugs/001/fix-summary.md:55,107,117` (out of source scope)
- **Description**: The real key string `super-secret-admin-key-12345` still
  appears in the fix-summary "Before" snippet and the manual-verification block.
  This is documentation, not compiled source, so it does not affect the runtime
  posture — but committing the literal to the repo keeps the leaked credential
  discoverable in git history.
- **Remediation**: Treat that value as burned and rotate it. Redact it in the
  docs (e.g. `super-secret-***`) and never use it as a live key in any
  environment. Out of this agent's edit scope (report-only); flag to maintainers.

### INFO-003 — Input validation on changed money/interest paths is sound
- **Severity**: INFO
- **Location**: `src/MiniBank/Bank.cs:27-52`, `src/MiniBank/InterestCalculator.cs:16-25`
- **Description**: `Withdraw` now rejects overdraft (`amount > Balance`) and
  non-positive amounts (`Bank.cs:37-45`); `Transfer` inherits the guard and is
  atomic — a failed `Withdraw` throws before any `Deposit`, so no partial
  transfer occurs (`Bank.cs:48-52`). `CalculateSimpleInterest` guards against
  negative principal, rate, and days, and divides by the named constant
  `DaysPerYear` (no magic number, no divide-by-zero). No untrusted input reaches
  a sink without a guard; the changed code performs only arithmetic and
  dictionary lookups — no injection vectors.
- **Remediation**: None.

## Residual Risk

- **Length oracle (LOW-001)** and **non-zeroed key material (LOW-002)** remain
  open by design choice; both are low-impact for an in-memory demo but should be
  revisited if `AuthService` is promoted to a real service.
- **Leaked literal in docs/git history (INFO-002)** is out of source scope and
  cannot be remediated by editing `src/MiniBank/`; the underlying credential
  should be rotated regardless.
- **Out of scope / not assessed**: transport security (no network surface),
  authorization model (auth is a single boolean admin gate — no role/policy
  checks were in scope), and rate limiting / lockout on repeated `Authenticate`
  failures (none present; acceptable for a demo, would be required in production).
- **Dependencies**: changed code uses only the BCL
  (`System.Security.Cryptography`, `System.Text`); no third-party or outdated
  packages introduced.

## References — files and lines inspected

- `context/bugs/001/fix-summary.md` — full file (change inventory)
- `src/MiniBank/AuthService.cs:1-35` — SEC-001 target; key handling + comparison
- `src/MiniBank/Bank.cs:27-52` — `Deposit` / `Withdraw` (BUG-001) / `Transfer`
- `src/MiniBank/InterestCalculator.cs:16-26` — `CalculateSimpleInterest` (BUG-002)
- `src/MiniBank/Account.cs:1-25` — reachable from `Bank`; `Credit`/`Debit` guards
- `src/MiniBank.Cli/Program.cs:37-46` — collateral edit; defensive auth try/catch
