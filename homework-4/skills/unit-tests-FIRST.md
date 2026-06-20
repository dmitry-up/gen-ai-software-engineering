---
name: unit-tests-FIRST
description: The FIRST principles (Fast, Independent, Repeatable, Self-validating, Timely) plus an explicit test-design reasoning procedure for writing good unit tests. Used by the Unit Test Generator when creating tests for changed code.
version: 1.1
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

## Test-design reasoning procedure (do this BEFORE writing any test)

FIRST tells you what a *good* test looks like; this procedure tells you *which*
tests to write so coverage is complete rather than accidental. Reason through
every step explicitly (use extended thinking) for each changed unit before
emitting code — this is the reasoning a strong skill supplies so the generator
model does not have to invent it:

1. **Contract** — state the unit's inputs, output, and its pre/post-conditions
   (what it guarantees, what it rejects). Read the changed code; do not assume.
2. **Equivalence partitioning** — split each input into classes that the code
   treats the same: valid-normal, valid-boundary, invalid. One representative
   test per class — not many tests from the same class.
3. **Boundary-value analysis** — for every ordered input, test *at* the boundary
   and *just across* it (e.g. `amount == balance` vs `amount == balance + 0.01`,
   `days == 0`). Bugs cluster on boundaries; this is where the seeded defects live.
4. **Error / guard paths** — every `throw` and guard clause gets a test asserting
   the exception type and that no state changed (e.g. balance unchanged on a
   rejected withdrawal, no money moved on a failed transfer).
5. **One assert per behaviour** — map each class/boundary/guard from steps 2–4 to
   exactly one focused test; collapse parameterised classes into `[Theory]` +
   `[InlineData]`. Confirm each resulting test still satisfies all five FIRST letters.

The `test-report.md` should make this reasoning visible: the Coverage Notes must
show, per changed method, which equivalence classes and boundaries are covered.

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
