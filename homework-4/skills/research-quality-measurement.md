---
name: research-quality-measurement
description: Rubric and labelled levels for scoring the quality of bug/codebase research before it is acted on. Used by the Research Verifier to grade codebase-research.md.
version: 1.0
---

# Skill: Research Quality Measurement

A deterministic rubric for grading codebase research so downstream agents
(Bug Planner, Bug Fixer) know how much to trust it. The **Research Verifier**
MUST apply this skill when writing `verified-research.md`.

## Dimensions (score each 0–2)

| # | Dimension | 0 (poor) | 1 (partial) | 2 (full) |
|---|-----------|----------|-------------|----------|
| D1 | **Reference accuracy** | File or line refs are wrong/missing | Files correct, some line refs off | Every file:line resolves to the cited code |
| D2 | **Snippet fidelity** | Snippets don't match source | Minor formatting drift | Snippets match source verbatim |
| D3 | **Root-cause correctness** | Wrong mechanism described | Symptom right, mechanism vague/partly wrong | Mechanism correctly identified |
| D4 | **Completeness** | Misses reported defects | Covers most, gaps noted | All reported defects covered |
| D5 | **Actionability** | No usable remediation direction | Vague direction | Clear, plan-ready remediation |

**Total = sum of D1..D5 (0–10).**

## Quality levels (labels)

| Level | Label | Score | Meaning / downstream action |
|-------|-------|-------|-----------------------------|
| L4 | **VERIFIED** | 9–10 | All claims check out. Plan directly. |
| L3 | **RELIABLE** | 7–8 | Minor issues; safe to plan after noting corrections. |
| L2 | **NEEDS-REVISION** | 4–6 | Material inaccuracies; correct them before planning. |
| L1 | **UNRELIABLE** | 0–3 | Do not act on as-is; send back to researcher. |

Tie-break rule: if **any** D1 or D2 dimension scores 0, the level is capped at
**L2 NEEDS-REVISION** regardless of total — a fixer cannot safely act on
references or snippets it cannot trust.

## Required output sections in `verified-research.md`

The verifier's result file must contain, in this order:

1. **Verification Summary** — overall PASS/FAIL and the **Research Quality**
   level + numeric score from this skill.
2. **Verified Claims** — each claim with VERIFIED / REFUTED / CORRECTED and the
   evidence (file:line actually checked).
3. **Discrepancies Found** — every mismatch between the research and the source,
   with the correction.
4. **Research Quality Assessment** — the per-dimension D1–D5 scores in a table,
   the total, the level, and one paragraph of reasoning (including any tie-break
   rule applied).
5. **References** — the exact files/lines inspected.

## Verifier procedure

1. For each finding, open the cited file and confirm the line range and snippet.
2. Confirm the described root cause matches what the code actually does.
3. Record VERIFIED / CORRECTED / REFUTED per claim with evidence.
4. Score D1–D5, apply the tie-break rule, derive the level.
5. Write all five sections above.
