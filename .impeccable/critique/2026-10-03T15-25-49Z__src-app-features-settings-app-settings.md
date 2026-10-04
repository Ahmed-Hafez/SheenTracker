---
target: app settings
total_score: 26
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
target_identity: "file:D:\\angular\\SheenTrack 360°\\src\\app\\features\\settings\\app-settings"
timestamp: 2026-10-03T15-25-49Z
slug: src-app-features-settings-app-settings
---
# Critique: App Settings tab

Method: dual-agent (A: design review · B: detector + browser evidence)

## Design Health Score
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | The success toast is the only confirmation. Focus is lost after Save. |
| 2 | Match System / Real World | 3 | Exclusion rules look independent, but any one alone hides a person. |
| 3 | User Control and Freedom | 2 | No per-chip undo and no preview of changes. The leave dialog has no "Save and leave". |
| 4 | Consistency and Standards | 2 | Two chip styles, mismatched editor widths, PrimeNG red on Discard. |
| 5 | Error Prevention | 2 | p-inputnumber [max] clamps silently. Typos and loose fragments get no warning. |
| 6 | Recognition Rather Than Recall | 2 | Exact names typed from memory; list not sorted. |
| 7 | Flexibility and Efficiency | 2 | No batch paste or bulk remove; filter and add are separate boxes. |
| 8 | Aesthetic and Minimalist Design | 3 | "Excludes nobody" shown twice; the 59-chip wall dominates. |
| 9 | Error Recovery | 3 | Inline server errors are good; the clamp hides the range error. |
| 10 | Help and Documentation | 4 | Precise scope and side-effect help text. |
| **Total** | | **26/40** | **Acceptable** |

## Design Specificity Verdict
Half purpose-built (domain copy, consequence groups, Deep Amber Save), half stock admin stack (five identical cards). Gaps against DESIGN.md: no DM Mono figures, chips off spec. Biggest miss: exclusions are treated as a form, not as "who is hidden, and why".
Detector: 5 advisory findings. Real: #e2e0dc off-token and the 10px icon (setting-editor.component.scss:146 and :141). False positive: rgb(0,0,0) on three HTML files. Browser: flat type hierarchy is real (h3 11px < body 13px; h1 = h4 = 15px). nested-cards and layout-transition are false positives or from the app shell. Contrast passes AA (Save 4.52, marginal). Chip remove targets are exactly 24px. No overflow at 390px.

## Priority Issues
1. [P0] Exclusions save blind: no change preview, no match count, no effect-worded Save. Command: shape, then harden.
2. [P1] Default Expected Hours clamps silently ([min]/[max] on p-inputnumber); no soft warning above 12h; no DM Mono. Command: harden.
3. [P1] Focus is lost after Save; Save/Cancel only appear on blur, so Tab skips them. Command: audit, then polish.
4. [P1] Flat type scale; Discard #ef4444 about 3.8:1 fails AA; input borders fail 1.4.11; #e2e0dc off-token. Command: typeset, then polish.
5. [P2] The 59-name list: inner scroll trap, unsorted, separate filter and add boxes, no batch paste. Command: layout, then distill.

## Persona Red Flags
- Alex (power user): no batch paste or bulk remove, unsorted list, names typed twice, a save per card, no autocomplete from Azure users.
- Sam (screen reader / keyboard): focus lost after Save, Save/Cancel not announced, multiselect chip says only "Remove", borders fail 1.4.11, "Excludes nobody" read twice, Discard fails contrast.
- Super Admin investigating a missing person: no lookup across rules, nothing says "hidden by: <rule>", no "who changed this".

## Minor Observations
- Empty notice keeps min-height. The unit wraps at 390px. Header copy is developer-facing. Exclusions should come first. Duplicate notice is grey. Fixture-mode shell toasts are noise.

## Questions to Consider
- Why does an exclusion save feel identical to changing a number?
- Would a "Hidden from hours summary" people view beat four rule lists?
- Why maintain exact names by hand when the app knows every Azure user?
