# App Settings: follow-up plan (continue from here)

Written 2026-10-03. Feature: `specs/001-app-admin-settings/`. Branch: `feature/app-settings`.

## Where things stand

- **Built and working:** the App Settings tab (Super Admin only, third tab), the fixture API, and the first critique round's fixes. Build passes and 16 unit tests pass.
- **Not committed.** Everything since commit `ab00b12` is uncommitted: the App Settings feature, the fixtures, the CLAUDE.md fixtures section, and the critique fixes. Commit first thing, before any new work.
- **Open task from tasks.md:** T029, the full quickstart run. It still needs a Super Admin login against the real backend (save persists after reload, the exact request body for departments, an invalid row in the database) and an axe accessibility scan. Under fixtures (`npm run start:fixtures`, port 4300) the rest has been checked.
- **Critique trend** for `app settings`: 26/40 → 28/40. The snapshots are in `.impeccable/critique/`. The second run had no P0 and three P1 issues.
- **Fixtures server** was left running on port 4300 and will need restarting tomorrow.

## Decisions still needed from you

The last question was declined for clarification. Answer these, or tell me what was unclear.

**1. Who is hidden (P1). How far should we go?**
- **A. Clickable counts (recommended).** Each match count opens a list of the people it matches. Uses the Azure users already loaded; no new screen.
- **B. Clickable counts plus an "Is this person excluded?" lookup** at the top of the exclusions group, naming the rule that hides them (exact name, fragment, department).
- **C. Skip for now.** Counts stay numbers only.

**2. Which other fixes go in the same pass?** (pick any)
- **Notices + comma splitting (P1).**
- **Field contrast (P1).**
- **Hierarchy + summary line (P2).**
- **Small polish (P2).**

Details for each are in the list below.

## Remaining issues from the second critique (28/40)

| # | Sev | Issue | Fix | Where |
|---|---|---|---|---|
| 1 | P1 | You can't see **who** a rule hides, and there is no person lookup. A hidden person can't be found by typing their name, because the filter searches saved entries only. | Per decision 1 above. | `setting-editor.component.*`, `setting-meta.ts` (`countMatches`) |
| 2 | P1 | Notices ("Already in the list", "Added…") render under the whole chip list, about 500px from the input. Typing "a, b, c" and pressing Enter makes **one** entry; only pasting splits. | Put the notice directly under the input and highlight the existing chip on a duplicate. Split on comma, semicolon or newline on Enter as well as paste. | `setting-editor.component.html` and `.ts` (`addEntry`, `onPaste`) |
| 3 | P1 | Field borders measure **2.25:1** against the white card (need 3:1). My earlier fix used `charcoal-400`, which is not dark enough. The gray fill makes fields read as disabled, and the disabled Add button is nearly invisible. | Darker charcoal border, white fill, and a distinct disabled style for Add. | `setting-editor.component.scss` (the `::ng-deep` border rule and `.field`) |
| 4 | P2 | Hierarchy is still shallow: type steps are 1.13× at best, and the topbar title (15px) is smaller than "App Settings" (18px). At rest the 59-chip block dominates and match counts are small gray digits. | Stronger group headings, a per-card DM Mono summary ("59 excluded · 2 match nobody"), counts in DM Mono, one tidy row of chips by default. The topbar title is in the app shell (`layout/header`), so it needs the same decision. | `app-settings.component.scss`, `setting-editor.component.*`, `layout/header` |
| 5 | P2 | The "New" tag, Save and "Show all" are exactly 4.52:1. Lists say "Discard changes" and "Save N changes" while the hours field says "Cancel" and "Save". The seniority card lacks the coverage line the department card has. | Burnt Amber (orange-900) for text on amber, one set of verbs, a coverage line on both enum cards. | `setting-editor.component.*` |

Also noted:
- The 16px group-title size is off DESIGN.md's type ramp (`app-settings.component.scss:32`). Either add 16px to DESIGN.md or move to a documented size.
- The placeholder text is cut off at 390px.
- The bare count digit inside chips may read as a stray number to a screen reader.

## Questions raised by the critique (for you to weigh)

- If the lists hide people from an HR report, why show counts but never names? Would a Super Admin trust a number they can't click?
- Should the page open on "Is this person excluded?", with the rule lists secondary?
- Fifty-nine "Employee NN" exact names look like data that should be a rule (a pattern, a department, or an Azure group). Should the app steer toward rules instead of hand-kept chips? That would need backend support, so it is probably a conversation with the backend owner, not a frontend change.

## Suggested order for tomorrow

1. **Commit** the current work, in logical pieces (for example: the feature, the fixtures, the critique fixes).
2. **Answer the decisions** above.
3. **`/impeccable harden`**: issues 2 and 1 (notices, comma splitting, and the match-list or lookup).
4. **`/impeccable polish`**: issues 3 and 5 (contrast, verbs, coverage lines).
5. **`/impeccable typeset` then `/impeccable layout`**: issue 4, only if you chose it.
6. **Re-run `/impeccable critique app settings`** and compare against 28/40.
7. **Finish T029** with a Super Admin login against the real backend, plus the axe scan.

## How to resume

- Start the fake-API server: `npm run start:fixtures`, then open http://localhost:4300/settings/app-settings. It signs you in as a Super Admin automatically.
- Typing into the hours field needs real keystrokes; setting the value from the browser console doesn't reach the form.
- The fake API and the Azure users fixture are in `src/app/core/fixtures/`.
