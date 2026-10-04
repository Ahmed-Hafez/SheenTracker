---
target: app settings
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:D:\\angular\\SheenTrack 360°\\src\\app\\features\\settings\\app-settings"
timestamp: 2026-10-03T18-07-28Z
slug: src-app-features-settings-app-settings
---
# Critique: App Settings tab (re-run)

Method: dual-agent (A: design review · B: detector + browser evidence)

## Design Health Score
Total 28/40 (Good): 1:3 2:3 3:3 4:3 5:3 6:3 7:3 8:2 9:3 10:2.

## Design Specificity Verdict
Competent and product-specific; the pending panel is the memorable device. At rest it is identical white cards with gray chips; match counts are small gray digits, not DM Mono figures. Detector: 4 advisories plus 3 overlay anti-patterns, none blocking. Real: 16px off the ramp (scss:32), flat type steps (1.13). False positives: rgb(0,0,0) at line 0, nested-cards on multiselects. Measured: field borders 2.25:1 (fail 1.4.11), Save/New tag/Show all at 4.52:1, chip buttons 24px, no overflow at 390px.

## Priority Issues
1. [P1] Can't see who a rule hides; no "is this person excluded?" lookup. Command: shape, then harden.
2. [P1] Notices render ~500px below the input; typed commas create one entry. Command: harden.
3. [P1] Field borders still 2.25:1 vs 3:1; gray fill reads disabled; disabled Add nearly invisible. Command: polish.
4. [P2] Shallow hierarchy (1.13 steps), topbar h1 smaller than h2, bland at rest, counts not DM Mono. Command: typeset, then layout.
5. [P2] 4.52:1 on New tag/Save/Show all; mixed verbs; seniority lacks coverage line. Command: polish.

## Persona Red Flags
Alex: no bulk remove, comma lists not parsed, no undo after Save. Sam: bare count reads as stray number, multiselect focus return unchecked. Super Admin: no person lookup, filter can't find hidden people.

## Questions to Consider
- Why counts but never names? Open on a person lookup? Should 59 exact names be a rule?
