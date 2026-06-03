# Security Report — Batch 001 (MiniBank)

> Produced by the **Security Verifier** agent (`agents/security-verifier.agent.md`).
> Scope: code changed by the Bug Fixer, per `fix-summary.md`. Report only — no
> code was modified.

## Summary

- **Overall posture**: ✅ Good. The previously seeded vulnerability **SEC-001** is
  fully remediated in the changed code. No new vulnerabilities introduced by the
  fixes.
- **Findings by severity**: CRITICAL 0 · HIGH 0 · MEDIUM 0 · LOW 1 · INFO 3.
- **Files reviewed**: `src/MiniBank/AuthService.cs`, `src/MiniBank/Bank.cs`,
  `src/MiniBank/InterestCalculator.cs`, `src/MiniBank.Cli/Program.cs`.

## Findings

### F-1 — SEC-001 hardcoded secret — RESOLVED · INFO
- **File**: `src/MiniBank/AuthService.cs:13–24`
- **Was**: `private const string AdminApiKey = "super-secret-admin-key-12345";`
  (secret committed to source control).
- **Now**: key is read from the `MINIBANK_ADMIN_API_KEY` environment variable (or
  injected via constructor); construction fails fast if unconfigured. No secret
  remains in source.
- **Verdict**: ✅ Resolved. **Remediation note**: rotate the old key
  `super-secret-admin-key-12345` — it lived in git history and must be considered
  compromised; purge it from history if this were a real repo.

### F-2 — SEC-001 non-constant-time comparison — RESOLVED · INFO
- **File**: `src/MiniBank/AuthService.cs:27–34`
- **Was**: `providedApiKey == AdminApiKey` (ordinal `==` short-circuits on first
  differing char → timing oracle).
- **Now**: `CryptographicOperations.FixedTimeEquals(provided, _adminApiKey)` over
  UTF-8 bytes — constant-time for equal-length inputs.
- **Verdict**: ✅ Resolved.

### F-3 — Secret length still leaks via timing — LOW
- **File**: `src/MiniBank/AuthService.cs:30–33`
- **Detail**: `FixedTimeEquals` returns early when the byte arrays differ in
  length, so an attacker can still distinguish "wrong length" from "wrong value".
  This is the standard, widely-accepted trade-off and far lower risk than the
  original flaw.
- **Remediation**: if length must be hidden, compare fixed-size hashes
  (e.g. SHA-256 of both keys) so inputs are always equal length. Optional.

### F-4 — Input validation on money operations — INFO
- **File**: `src/MiniBank/Bank.cs:35–46`, `:48–52`
- **Detail**: `Withdraw` now validates `amount > 0` and `amount <= balance`;
  `Transfer` inherits the guard and is atomic (a failed `Withdraw` throws before
  any `Deposit`, so no partial transfer). No injection surface (in-memory only).
- **Verdict**: ✅ No issue. Noted as positive validation coverage.

## Residual Risk

- **F-3 (LOW)**: key-length timing leak — acceptable for this app.
- **Out of scope**: no persistence, network, or web surface exists, so
  SQL/command injection, XSS, and CSRF are **N/A** for this batch.
- **Operational**: the env-var key is process-readable; in production prefer a
  secrets manager (Key Vault / AWS Secrets Manager). Not a code defect.

## References

- `src/MiniBank/AuthService.cs:1–35` (rewritten auth)
- `src/MiniBank/Bank.cs:35–52` (Withdraw / Transfer)
- `context/bugs/001/fix-summary.md` (change list under review)
