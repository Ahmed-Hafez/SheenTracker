---
target: dashboard
total_score: 22
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\Sheen\\Shura Solutions\\SheenTrack-360°\\src\\app\\features\\dashboard"
timestamp: 2026-10-04T10-41-30Z
slug: src-app-features-dashboard
---
Method: dual-agent (A: design review, B: detector + browser)

# Dashboard critique: 22/40 (Acceptable)

Scores: H1 2, H2 3, H3 3, H4 2, H5 3, H6 2, H7 2, H8 2, H9 1, H10 2.

Verdict: chrome is authored (Ember Ledger), content is interchangeable. Answers "what did we log", not "where are the gaps". Expected never shown beside Actual.

Detector: 7 advisory design-system-color (#888/#333/#9A9A9A ECharts text in dashboard.component.ts), skipped-heading h1->h3, toast contrast/layout-transition hits are PrimeNG (partial false positives).

## Priority issues
- [P1] Error/empty states silent and deceptive (ts:230-237): per-section errors, n/a not 0, fixtures for projects-hours/top-performers. /impeccable harden
- [P1] Dashboard does not surface gaps (html:5-55): KPI hints, drill-through to filtered users, move Target/Compliance up, shrink charts, Expected beside Actual. /impeccable layout, distill
- [P2] Chart colours break DESIGN.md (ts:147, 240-348): default blue series, multi-hue pie, hardcoded greys. /impeccable colorize
- [P2] Charts inaccessible, colour-only buckets, duplicate Export names, no h2. /impeccable harden
- [P2] Cool grey drift, stray mt-4 (html:114), unused logComplianceSubtitle. /impeccable polish
