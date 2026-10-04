---
target: settings screen
total_score: 15
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:D:\\angular\\SheenTrack 360°\\src\\app\\features\\settings"
timestamp: 2026-10-03T14-02-51Z
slug: src-app-features-settings
---
# Critique: Settings (src/app/features/settings)
Method: dual-agent

## Design Health Score
1 Visibility 1 | 2 Match 2 | 3 Control 2 | 4 Consistency 1 | 5 Error prevention 2 | 6 Recognition 2 | 7 Efficiency 2 | 8 Minimalism 1 | 9 Recovery 1 | 10 Help 1 | Total 15/40 (Poor)

## Design Specificity Verdict
- Generic "admin settings" template that has drifted off the Ember Ledger palette.
- The inner menu offers one real page (Users & Permissions) and two placeholders (General is a dead route, Integrations is disabled).
- "Users" in the sidebar and "Users & Permissions" in Settings collide.
- Detector: 21 findings (15 off-palette colours, 3 off-scale radii, 2 off-scale font sizes including 8px, side-tab at settings.component.scss:26).
- Browser overlay: white on Signal Amber is 2.7:1 on the primary button. This is a design-system issue.

## Priority Issues
- [P1] Menu-in-menu is mostly placeholder. 260px p-menu with role=menu and no aria-current. Fix: delete the inner menu, General and Integrations; make Settings a single page. /impeccable distill + layout
- [P1] Dialog accessibility broken: focusOnShow=false, password labels point to missing ids, unnamed switch, h2 "Account Status" with stray U+0650, h4 title, dismissableMask loses the form. /impeccable harden
- [P1] Load failure shows "No users match the current filters" (html:122). Contrast fails: #7a7a7a 3.84, active item 2.53, subtitles ~2.6, chips 2.9, primary button 2.7. Unlabeled search and icon-only row actions. /impeccable audit + clarify
- [P2] Deactivate is one click with no undo; four equal-weight row actions; generic delete copy. /impeccable harden
- [P2] Phone: horizontal scroll (398px content in 375px viewport), Add User balloons, search collapses to an icon. Token drift in radii, shadows and inline table styles. /impeccable adapt + polish

## Structure alternatives
- A (recommended): Settings becomes a single Users & Permissions page. Remove the inner menu and /settings/general; keep a /settings redirect; optionally rename the sidebar item to "Access".
- B (later): an expandable Settings parent in the sidebar once a second real section exists.
- C: tabs under the topbar title, only worthwhile with 2-4 real peer sections.

## Persona Red Flags
- Alex (power user): no filters, sort or bulk actions; four icon targets per row.
- Sam (keyboard and screen reader): two h1s; menu role on page links; focus left behind the dialog; unlabeled password fields and switch; row actions don't name the user.
- Coordination lead adding a colleague: can't see what each role grants; types a password twice with no invite step; stray click loses the form.

## Questions to Consider
- Would anyone notice if General and Integrations were deleted?
- Should access management fold into System Users?
- Should Add User send an invite instead of setting a password?
- Should primary buttons use Graphite text or a Deep Amber fill to pass AA?
