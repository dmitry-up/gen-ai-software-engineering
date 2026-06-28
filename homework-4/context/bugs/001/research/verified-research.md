# Verified Research — Batch 001 (MiniBank)

> Produced by the **Research Verifier** agent (`agents/research-verifier.agent.md`).
> Grading rubric: **`skills/research-quality-measurement.md`**.
> Source of record verified against working tree of `src/MiniBank/`.

## 1. Verification Summary

- **Overall result**: ✅ PASS (research is usable after one correction).
- **Research Quality**: **L3 — RELIABLE** (score **8 / 10**).
- **One-line verdict**: References and snippets are accurate and verbatim, but
  finding R2 states the **wrong root cause**; the corrected mechanism is recorded
  below so the Bug Planner can rely on this file.

## 2. Verified Claims

| Finding | Status | Evidence (re-read from source) |
|---------|--------|--------------------------------|
| **R1** — overdraft in `Withdraw` | ✅ VERIFIED | `src/MiniBank/Bank.cs:35–42` — `Withdraw` checks `amount <= 0` only, then calls `account.Debit(amount)` at line 41 with no balance comparison. Snippet matches verbatim. |
| **R2** — interest formula | ⚠️ CORRECTED | `src/MiniBank/InterestCalculator.cs:25` — snippet `return principal * annualRate * days;` matches verbatim and the file/line is correct, **but** the described mechanism ("integer-division truncation") is wrong. `days` is multiplied, not divided, and all operands are `decimal`, so no integer truncation occurs. **Actual root cause: the result is never divided by the days-in-year (`DaysPerYear = 365`), so it returns the annual-rate product scaled by raw day count — an over-statement, not a truncation.** |
| **R3** — hardcoded key + insecure compare | ✅ VERIFIED | `src/MiniBank/AuthService.cs:8` holds `private const string AdminApiKey = "super-secret-admin-key-12345";`; line 12 returns `providedApiKey == AdminApiKey` (non-constant-time). Both file/lines and snippets match verbatim. |

## 3. Discrepancies Found

| # | Location | Research claimed | Reality | Correction |
|---|----------|------------------|---------|------------|
| D-1 | `InterestCalculator.cs:25` | "integer-division truncation … truncating the result to zero for short periods" | Operands are `decimal`; there is no division at all in the expression. The value is over-stated, never truncated to zero. | Root cause is a **missing `/ DaysPerYear` divisor**. Fix = `principal * annualRate * days / DaysPerYear`. |

No discrepancies found for R1 or R3 (file paths, line ranges, and snippets all matched the source verbatim).

## 4. Research Quality Assessment

| Dim | Meaning | Score | Reasoning |
|-----|---------|-------|-----------|
| D1 | Reference accuracy | 2 | Every cited `file:line` resolves to the cited code. |
| D2 | Snippet fidelity | 2 | All three snippets match the source verbatim. |
| D3 | Root-cause correctness | 1 | 2 of 3 root causes correct; R2's mechanism ("integer truncation") is wrong. |
| D4 | Completeness | 2 | All three reported defects (BUG-001, BUG-002, SEC-001) are covered. |
| D5 | Actionability | 1 | R2's wrong mechanism could misdirect an implementer (e.g. toward type casts instead of adding a divisor), so actionability is partially compromised. |
| **Total** | | **8 / 10** | |

**Level**: total 8 → **L3 RELIABLE**. Tie-break rule (cap at L2 if any D1/D2 = 0)
does **not** apply, since D1 = D2 = 2. Consistent with the L3 description
("minor issues; safe to plan after noting corrections"): the single corrected
root cause is recorded here, so downstream planning is safe.

## 5. References

- `src/MiniBank/Bank.cs:35–42` (Withdraw)
- `src/MiniBank/InterestCalculator.cs:6` (`DaysPerYear` constant), `:25` (return)
- `src/MiniBank/AuthService.cs:8` (secret), `:12` (comparison)
- Input research: `context/bugs/001/research/codebase-research.md`
- Skill: `skills/research-quality-measurement.md`
