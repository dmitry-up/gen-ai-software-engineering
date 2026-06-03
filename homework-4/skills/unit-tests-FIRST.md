---
name: unit-tests-FIRST
description: The FIRST principles (Fast, Independent, Repeatable, Self-validating, Timely) for writing good unit tests. Used by the Unit Test Generator when creating tests for changed code.
version: 1.0
---

# Skill: Unit Tests — FIRST

Every unit test the **Unit Test Generator** writes MUST satisfy all five FIRST
principles. The generator must also include a short FIRST compliance note in
`test-report.md`.

## The FIRST principles

| Letter | Principle | What it means | Concrete rules |
|--------|-----------|---------------|----------------|
| **F** | **Fast** | Tests run in milliseconds so the suite runs constantly. | No real I/O, network, DB, `Thread.Sleep`, or wall-clock waits. Pure in-memory objects. |
| **I** | **Independent** | No test depends on another or on execution order. | No shared mutable static state; construct fresh objects per test; never rely on side effects from a previous test. |
| **R** | **Repeatable** | Same result every run, every machine. | No reliance on `DateTime.Now`, random seeds, culture, time zone, or environment unless explicitly controlled/injected. |
| **S** | **Self-validating** | Pass/fail is decided by asserts, not by a human reading output. | Every test ends in an assertion; no `Console.WriteLine`-only "tests"; one clear behavioural outcome per test. |
| **T** | **Timely** | Tests target the code that changed, written alongside the change. | Cover only new/changed code in this batch; include the boundary/edge cases the change introduces. |

## Application rules for this pipeline

- **Scope**: test only the methods listed as changed in `fix-summary.md`
  (here: `Bank.Withdraw`/`Transfer`, `InterestCalculator.CalculateSimpleInterest`,
  `AuthService.Authenticate`/constructor). Do **not** add broad tests for
  untouched code.
- **Framework**: match the project — xUnit (`[Fact]` / `[Theory]`).
- **Naming**: `Method_Condition_ExpectedResult`.
- **Determinism (R)**: if a unit reads the environment (e.g. `AuthService`),
  inject the value via constructor in the test instead of mutating the real
  environment variable.
- **One behaviour per test (S)**: assert a single outcome; use `[Theory]` with
  `[InlineData]` for parameterised equivalence classes.
- **Edge cases (T)**: include the just-introduced boundaries — exact-balance
  withdrawal, over-balance withdrawal, zero days, empty/short key,
  correct vs. wrong key.

## FIRST self-check (must appear in test-report.md)

For the generated suite, confirm each letter with one line of evidence:

- F — no I/O / sleeps; suite runtime recorded.
- I — each test builds its own `Bank` / `AuthService`; no shared state.
- R — no `DateTime.Now` / randomness; env injected, not mutated.
- S — every test has asserts; list count of assertions.
- T — tests map 1:1 to the changed methods in `fix-summary.md`.
