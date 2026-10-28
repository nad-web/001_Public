# Vibe coding with professional habits

AI is a coding partner. The portfolio should show that you can frame a useful problem, make technical decisions, inspect generated code, find faults, and verify the result.

## The loop

1. **Describe the user problem.** Give examples and constraints.
2. **Define acceptance criteria.** State observable outcomes for a small first version.
3. **Ask for a small implementation slice.** Keep the diff reviewable.
4. **Read and question the code.** Explain its state, data flow, and failure cases in your own words.
5. **Try real behavior.** Include awkward inputs and keyboard/mobile use.
6. **Correct with evidence.** Supply the failing input and observed result.
7. **Document and ship.** Record the decisions, actual checks, and limits.

## Prompt: start an app

```text
Work in 001_Public. Read AGENTS.md, docs/APP_GUIDE.md, and the chosen
app’s concept in Vibcoding/catalogue.json.

Build Deutsch Daily under Vibcoding/languages/deutsch-daily/.
If it does not exist, use the generator. Keep it prototype while developing.

Audience: beginner German learners.
First version: a small reviewed word set, reveal/recall practice,
topic selection, local progress, and an explicit reset option.

Use browser-only HTML/CSS/JavaScript and relative paths. Keep all assets
and source in the app folder. Avoid accounts, remote APIs, and paid services.

Before implementation, write specific acceptance criteria in the README.
Implement in small steps, review the logic, and test the actual user flow.
Record observed evidence and limitations in the case study. Do not call
the app ready until those criteria pass.
```

## Prompt: review an implementation

```text
Review the current app against its README acceptance criteria.
Trace input validation, state transitions, persistence, error handling,
relative asset paths, keyboard use, and narrow-screen behavior.
Report concrete findings with file paths and reproducible examples.
Fix clear defects within the agreed scope, rerun appropriate checks,
and update the case study with actual evidence.
```

## Prompt: fix a reproducible bug

```text
In [app path], this input produces [observed behavior].
I expected [specific result]. Here are the reproduction steps: [...].
Find the cause, make the smallest coherent fix, and add a regression test
if the behavior is important enough to justify one. Check related edge
cases and describe the resulting behavior and remaining limits.
```

## Evidence to keep

Keep short, sanitized prompt examples, meaningful commits, actual failures you found, technical decisions you changed, and screenshots of the real app. Record AI-generated work and your own design, review, and testing honestly. Never publish account tokens or private chat contents.

## Questions you should be able to answer

- Where is app state stored, and what happens on reload?
- What inputs are allowed, and what happens when they are invalid?
- What would break at a different URL prefix or screen width?
- Which calculations or state changes are covered by meaningful tests?
- Why does this app need its chosen dependencies?
- What is the most important current limitation?

The strength of the portfolio is the quality you can explain and demonstrate.
