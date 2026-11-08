---
name: roadmap-execution
description: >-
  Orchestrate the build of Umbrielship by walking ROADMAP.md one item at a time through the
  tlc-plan -> tlc-implement pipeline, with CONTEXT.md as the binding vocabulary. The
  orchestrator picks the next item whose Status line is not "built", cleans the environment,
  dispatches a Planner and a Builder sub-agent, runs the gates, and confirms the item now reads
  built. It does not plan, implement, verify or edit ROADMAP.md itself. When no item is open it
  reports the roadmap complete and stops. Use for "build the next roadmap item", "advance the
  roadmap", "run the roadmap loop", "roadmap-execution", or under /loop.
metadata:
  project: umbrielship
  version: 0.1.0
---

# Roadmap Execution

**Driver only.** Planning, the plan format, checks, build rules, the Verifier and every gate live
in **tlc-plan** and **tlc-implement**. This skill sequences them over `ROADMAP.md` and does not
restate them. The orchestrator never writes a plan, a check, code, a test or a document; the one
line it writes is a plan's `**Approved**:` line.

```
┌──────┐   ┌───────┐   ┌─────────┐   ┌─────────┐   ┌───────┐
│ PICK │ → │ CLEAN │ → │ PLANNER │ → │ BUILDER │ → │ CLOSE │ → next item
└──────┘   └───────┘   └─────────┘   └─────────┘   └───────┘
ROADMAP.md   ports       tlc-plan     tlc-implement  Status gate + report
```

## What this repo adds

| Delta | Meaning |
| --- | --- |
| **Sources** | `ROADMAP.md` says what and in which order. `CONTEXT.md` is the binding vocabulary. `AGENTS.md` is the structure and testing contract. The orchestrator edits none of them. |
| **Sub-agent roles** | Planner runs **tlc-plan**. Builder runs **tlc-implement**, which dispatches its own Verifier. Each is a fresh sub-agent with none of this chat. |
| **Progress** | Each `ROADMAP.md` item (`## N. Title`) ends with a `**Status:**` line. An item is open when that line is missing or does not start with `**Status:** built`. The Builder writes the line as the plan's last criterion; the orchestrator only reads it. Titles ending in `(proposal)` are not approved work: the loop stops and asks the user before planning one. |
| **Where a feature stopped** | Its files under `.specs/features/<slug>/` and git, as `tlc-implement/references/memory.md` says. `.specs/` does not exist until the first plan creates it. |
| **Approval mode** | `attended` (default): the loop stops at every plan for the user's approval. `unattended`, only when the invocation says so: the invocation is the approval, written as the user's words; gray areas become `Assumptions` rows with `Confirmed? n` and are listed in the report. |
| **Auto-commit in flow** | The Builder commits per slice only when the user's invocation allows it, local only. Nothing in this flow pushes. The orchestrator commits nothing. |
| **One item per run** | One invocation advances one item. Under `/loop` the skill runs until no item is open, then ends the loop. |

## Roadmap items

`ROADMAP.md` is the record; this table is the state on 2026-11-08. When they disagree,
`ROADMAP.md` wins and this table is fixed.

| Item | Title | Status |
| --- | --- | --- |
| 1 | Identity and access | built |
| 2 | Customers | built |
| 3 | Vessels | built |
| 4 | Work orders, services and images | built |
| 5 | Tests foundation (proposal) | open |
| 6 | Error mapping cleanup (proposal) | open |
| 7 | Pagination fix (proposal) | open |

The open items, in order (empty output: none):

```bash
awk '/^## / { if (item != "" && !built) print item; item = ($0 ~ /^## [0-9]+\./) ? $0 : ""; built = 0 }
     /^\*\*Status:\*\* built/ { built = 1 }
     END { if (item != "" && !built) print item }' ROADMAP.md
```

A change to a built item (an audit fix, a follow-up) goes through **tlc-plan** directly, outside
this loop.

## Orchestrator flow

1. **Pick.** Run the command above and take the first line. No line: report
   `roadmap complete: every item of ROADMAP.md is built` and stop. A `(proposal)` title: say so and
   wait for the user to confirm the item (the user edits the title or says to go ahead) before step 2.
2. **Resume or start.** Find the item's feature, the plan whose `## Sources` cites the item:

   ```bash
   grep -l '`ROADMAP.md` item <N> - binding' .specs/features/*/plan.md
   ```

   None (or no `.specs/`): start a feature with a new slug, the item's subject in kebab-case with
   no number (`tests-foundation`), not already a folder. Found: the files say where it stopped:

   | The feature shows | Continue at |
   | --- | --- |
   | `plan.md` that `validate_plan.py` rejects | step 4, with the gate's output |
   | `plan.md` with no `**Approved**:` line | step 5 |
   | `**Approved**:` and `validate_verification.py` not 0 | step 6; **tlc-implement** resumes from its own files |
   | `validate_verification.py` 0 and the item still open | step 6, to land the Status line and the as-built documents |

3. **Check the tree and clean.** `git status --porcelain` is empty, or every dirty path is under
   `.specs/`. Anything else is someone's work: stop and say so. Free ports **4200** (`ng serve`)
   and **3333** (the API's `PORT`). PostgreSQL (`DATABASE_URL`) must be reachable before the
   Builder applies a migration or walks the built API; where it is not, stop and say so. Do not
   free its port.
4. **Dispatch the Planner.** Send the prompt below. Done when `.specs/features/<slug>/plan.md`
   exists and `python3 .cursor/skills/tlc-plan/scripts/validate_plan.py <slug>` exits 0, run by
   the orchestrator from the repository root, never trusted from the report.
5. **Approval gate.** `attended`: present the plan and the open questions, and stop. On the next
   run, when the user's words approve it, write them on the `**Approved**:` line and go to step 6.
   A `blocks` question stops the loop in either mode. `unattended`: write
   `**Approved**: <YYYY-MM-DD> - user: "<the literal invocation text>"` under the title, and only
   that text. Never write words the user did not type.
6. **Dispatch the Builder.** Send the prompt below. The Builder runs Checks, Build and Verify,
   including the Verifier sub-agent and the fix rounds **tlc-implement** owns. Done when
   `python3 .cursor/skills/tlc-implement/scripts/validate_verification.py <slug>` exits 0, run by
   the orchestrator.
7. **Red gate.** Send the Builder back with the gate's output, at most **3** Builder dispatches in
   one run. A stop-and-ask from the Builder, or a third red gate, ends the run: the question and the
   gate's last line go in the report, and the item stays open.
8. **Close.** Run the open-item command again: the item must be gone, because its Status line now
   starts `**Status:** built`. Still listed: a red gate (step 7). Gone: report.
9. **Next.** Standalone: stop and report. Under `/loop`: go to step 1.

## Sub-agent prompts

Sub-agents cannot see this chat. Each prompt is self-contained and holds, in this order:

1. **Activate the skill by name** - `tlc-plan` for the Planner, `tlc-implement` for the Builder.
   If it cannot be invoked, read `.cursor/skills/<name>/SKILL.md` and follow it. If neither works,
   STOP and say so.
2. **Item context** - the item number and title, its paragraph from `ROADMAP.md` quoted verbatim
   (the Status line excluded), the feature slug, the output directory `.specs/features/<slug>/`,
   and the repository path.
3. **Mode** - `attended` or `unattended`, as the table above says.
4. **Language** - prose and headings in English; domain terms as `CONTEXT.md` writes them;
   identifiers never translated; screen copy in Portuguese; the user's words quoted as typed.
5. **Project glue** (below).
6. **Role footnotes only:**

- _Planner:_ the feature holds the whole item; cut it into slices only as **tlc-plan** allows.
  `## Sources` cites `` `ROADMAP.md` item <N> - binding ``. The last criterion describes the item
  as built: its `**Status:**` line in `ROADMAP.md` starting `**Status:** built`, and `CONTEXT.md`
  and `AGENTS.md` updated where the change touches them. Return the gate's last line and every
  open question.
- _Builder:_ the path to the approved `plan.md`; run its own Verifier as **tlc-implement** says;
  never `git push`; commit per slice only when the invocation allows it. Return
  `validate_verification.py`'s last line, the commit range (if any), and every finding still open.

Do not paste the tlc templates, reference file names or quality rules into the prompt: the skills
own them.

## Project glue

Append to every sub-agent prompt. Point at the files; do not restate them.

- `ROADMAP.md` - the items, their order, and each item's Status line
- `CONTEXT.md` - the binding vocabulary, each term's `Avoid` list included
- `AGENTS.md` - structure, commands, environment, the rules a plan obeys
- `.cursor/skills/modular-architecture/SKILL.md` - read before a module, a use case, a controller,
  a repository, a Prisma model, or a cross-module dependency in `api`
- `.specs/STATE.md` `## Decisions` and `.specs/LESSONS.md` - when they exist, every `active`
  decision binds

## Stops

The loop stops, and says why first, when: no item is open (roadmap complete); the next item is a
proposal the user has not confirmed; a sub-agent cannot activate its skill; the tree holds work
outside `.specs/`; a port cannot be freed or PostgreSQL is down; the Planner leaves a `blocks`
question; the plan waits for approval in `attended` mode; a gate is red after the third Builder
dispatch of the run; the Builder asks. A stop never skips an item. Under `/loop`, every stop ends
the loop.

## Output

Per item, lead with the verdict: the last line of the gate that ran, the item and slug, the
commit range, the `Assumptions` rows with `Confirmed? n`, the findings and lessons the Builder
reported, and what the next run does. With no open item, one line: `roadmap complete: every item
of ROADMAP.md is built`. Do not narrate the phases.
