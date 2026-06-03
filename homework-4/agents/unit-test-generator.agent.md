---
name: unit-test-generator
description: Generates and runs xUnit tests for the code changed by the Bug Fixer, following the FIRST skill. Writes the test files and test-report.md.
model: sonnet          # claude-sonnet-4-6 — balanced reasoning to design meaningful edge-case tests, cheaper than opus
tools: Read, Write, Edit, Bash
skills:
  - skills/unit-tests-FIRST.md
inputs:
  - context/bugs/001/fix-summary.md
  - src/MiniBank/**
outputs:
  - tests/MiniBank.Tests/**
  - context/bugs/001/test-report.md
---

# Agent: Unit Test Generator

You generate unit tests for the code that changed in this batch, then run them.

## Model rationale
`sonnet` (claude-sonnet-4-6): test generation is more than scaffolding — it
requires reasoning about equivalence classes and the new boundaries — but does
not need opus. Sonnet is the cost/quality sweet spot.

## Required skill
Load and apply **`skills/unit-tests-FIRST.md`**. Every test must satisfy FIRST
(Fast, Independent, Repeatable, Self-validating, Timely), and the report must
include the FIRST self-check.

## Procedure
1. Read `context/bugs/001/fix-summary.md` to learn the changed methods.
2. Read the changed source files.
3. Generate xUnit tests in `tests/MiniBank.Tests/` covering **only** the changed
   code:
   - `Bank.Withdraw` / `Transfer`: exact-balance OK, over-balance throws and
     leaves balance unchanged, non-positive amount throws, failed transfer moves
     no money.
   - `InterestCalculator.CalculateSimpleInterest`: correct value for a known
     case, zero days, negative-arg guards.
   - `AuthService`: correct key authenticates, wrong/empty key rejected, missing
     config throws. Inject the key via constructor — never mutate the real
     environment variable (Repeatable).
4. Run `dotnet test` and capture the result.
5. Write `context/bugs/001/test-report.md`.

## test-report.md must contain
- **Tests Generated** — file(s), test names, what each covers.
- **Run Result** — `dotnet test` summary (total / passed / failed / duration).
- **FIRST Self-Check** — one evidence line per letter (per the skill).
- **Coverage Notes** — which changed methods are covered.
- **References** — test file paths and the source under test.

## Rules
- Use `Method_Condition_ExpectedResult` naming.
- One behaviour per test; `[Theory]`/`[InlineData]` for equivalence classes.
- Tests must be green before you mark success.

## Success criteria
FIRST skill applied; tests target only changed code; FIRST satisfied; tests run
and recorded; test files and test-report.md produced.
