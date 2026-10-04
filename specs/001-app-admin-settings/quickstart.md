# Quickstart: validate App Settings

## Prerequisites

- The backend runs with PR #5 merged and migrated.
- All five Setting rows have been inserted by hand: `DefaultExpectedHours`, `ExcludedDisplayNames`, `ExcludedDisplayNameContains`, `ExcludedDepartments` and `ExcludedSeniorities`. See the "Deploy sequence" in the backend spec.
- You have two accounts: one Super Admin, and one with Coordination but not Super Admin.
- Run `npm start` (http://localhost:4200).

## Automated

```bash
npm test          # settings.service, setting-meta helpers, app-settings component specs
npm run build     # 0 errors
```

## Manual scenarios

| # | Steps | Expected |
|---|---|---|
| 1 | As the Coordination user, open Settings. | The tabs are General and Users & Permissions only. Browsing to `/settings/app-settings` lands on `/forbidden`. The network panel shows no `settings` request. |
| 2 | As the Super Admin, open Settings. | The tabs are General, Users & Permissions and App Settings, in that order. |
| 3 | Open App Settings. | There are two groups, "New System Users" and "Hours summary exclusions". Each Setting shows its label, help text, value and "Last updated". |
| 4 | Set Default Expected Hours to `25`, then `7.555`. | An inline error appears, Save is disabled, and no request is sent. |
| 5 | Set it to `7.5` and Save. | A success toast appears. The value shows 7.5 and Last updated refreshes. Reloading the page still shows 7.5. |
| 6 | Add `  Build Bot ` and `build bot` to Excluded display names, then Save. | One entry is stored, `Build Bot`, as the server returns it. |
| 7 | Clear Excluded seniorities and Save. | It saves, and the Setting reads "Excludes nobody". |
| 8 | Pick departments in the multi-select and Save. | The labels display, for example "Quality Assurance". The request body contains enum names, for example `"QualityAssurance"`. |
| 9 | Edit a Setting, then Cancel. | The Setting goes back to its saved value, and the Save and Cancel buttons disappear. |
| 10 | Edit a Setting, then click the General tab. | A confirm dialog appears. Choosing Stay keeps the edits, and Leave discards them. |
| 11 | Stop the backend and reload App Settings. | The error state appears with Try again. Starting the backend and pressing Try again loads the Settings. |
| 12 | In the database, set a row's value to invalid JSON, then reload. | The error state shows the server message naming that key. |
| 13 | At 390px width, repeat 3, 5 and 6. | There is no horizontal page scroll, and every control is reachable. |
| 14 | Run the axe DevTools scan on the App Settings tab. | 0 violations. Every action works by keyboard, and inline errors are announced. |
