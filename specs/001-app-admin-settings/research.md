# Research: App Settings (Admin)

There were no open NEEDS CLARIFICATION items in Technical Context. Each decision below resolves a design choice. The sources were the backend PR #5 patches (ShuraSolutions/SheenTracker-BE) and the current frontend code.

## R1. API contract source of truth

- **Decision**: Model the client on backend PR #5 exactly. There are three endpoints, `GET /api/settings`, `GET /api/settings/{key}` and `PUT /api/settings/{key}` with body `{ value }`. Every response is wrapped in `ApiResponse<T>`. The details are in [contracts/settings-api.md](contracts/settings-api.md).
- **Rationale**: The backend is merged and is the only consumer contract, and its spec explicitly leaves frontend work to us.
- **Alternatives considered**: Mock data first. Rejected because the API exists. A mock is useful only for offline work and is not required.

## R2. Where the settings live in the UI

- **Decision**: Add a new child route, `settings/app-settings`, as the third tab after Users & Permissions. The tab list in `SettingsComponent` becomes role-filtered.
- **Rationale**: The user asked for this after the spec was first written. It also leaves the General tab untouched.
- **Alternatives considered**: Replacing the General empty state. The user rejected it.

## R3. Restricting the tab to Super Admins

- **Decision**:
  - Add `appSettings: [SUPER_ADMIN]` to `PAGE_ROLES`.
  - Guard the child route with `roleGuard(PAGE_ROLES.appSettings)`. It already redirects to `/forbidden`, and it runs before the component exists, so no request is sent.
  - `SettingsComponent` filters `sections` with `hasRole(userRoles, ...section.roles)` from the `AuthService.getUserData()` roles.
  - The `''` redirect stays on `users-permissions`.
- **Rationale**: This reuses the single role map that drives the guards and the sidebar, so a tab can never show for a role the guard refuses. `hasRole` already lets Super Admins through, and the only role listed is SuperAdmin.
- **Alternatives considered**:
  - Using `@if (isSuperAdmin)` in the template. That would duplicate the rule outside `PAGE_ROLES`.
  - Hiding the tab without a guard. That fails FR-002 when someone opens the URL directly.

## R4. HTTP service shape

- **Decision**:
  - Add a new `SettingsService` in `core/http/backend_service/settings.service.ts`, built on `ApiService`. It has `getAll()`, `get(key)` and `update(key, value)`, each unwrapping `response.data`.
  - DTO types go in `core/models/reponse/settings.response.model.ts` and `core/models/request/update-setting.request.model.ts`.
- **Rationale**: It matches the existing services, such as `squads.service.ts`, and follows CLAUDE.md, which says all requests go through `ApiService`. It is typed, without the `any` used elsewhere.
- **Alternatives considered**: Keeping state in the service with signals, as `SquadsService` does. Rejected because only one screen uses this data, so the state belongs in the component.

## R5. Editors per type

| `type` | Control | Notes |
|---|---|---|
| `Decimal` | PrimeNG `p-inputnumber` with `minFractionDigits=0` and `maxFractionDigits=2`, plus Reactive Forms validators `min(0)`, `max(24)` and `required` | The 0–24 limit applies only to `DefaultExpectedHours`. Validators come from per-key metadata, so a future Decimal Setting gets only `required`. |
| `Int` | `p-inputnumber` with `maxFractionDigits=0` | Future-proofing (FR-005). It needs only a small branch. |
| `String` | Text input | Future-proofing. |
| `Bool` | `p-toggleswitch` | Future-proofing. |
| `StringList` | `p-autocomplete` with `[multiple]="true"` and `[typeahead]="false"` (PrimeNG 21 dropped `p-chips`, and this is the replacement) | Enter adds a chip. Blank input is ignored. Chips can be removed by keyboard. See the large-list note below. |
| `DepartmentList` | `p-multiselect` built from `Departments` and `[filter]="true"` | Options are `{ label, value: Department[enumValue] }`, so the value is the canonical enum **name**. |
| `SeniorityList` | `p-multiselect` built from `Seniorities` | Same approach as departments. |

- **Large list (US3, scenario 5)**:
  - The display-name list holds about 60 entries. It renders as a wrapping chip list inside a bounded, scrollable region with a "N entries" count.
  - A local "Filter entries" text input narrows the visible chips, so they can be found and removed without reading all 60.
- **Rationale**: Each control matches the shape of its value. The multi-selects make typos impossible, which the server would otherwise reject with a 400.
- **Alternatives considered**:
  - A textarea with one name per line for `StringList`. It is simpler, but removing a single entry is harder and blank lines need handling.
  - Free-text department entry. That fails FR-006.
- **To verify during implementation**: check through context7 that PrimeNG 21's `p-autocomplete` supports `multiple` with `typeahead=false` and that `p-inputnumber` exposes `ariaLabel` and `inputId`.

## R6. Department and seniority name mapping

- **Decision**: Send the TypeScript enum key names, using `Department[Department.QualityAssurance]` which gives `"QualityAssurance"`. Display the existing labels from the `Departments` and `Seniorities` arrays. If a stored name has no frontend label, show the raw name instead of dropping it, so the value is never lost silently.
- **Rationale**: The backend validates against its `Department` and `Seniority` enum names and returns them in canonical form. The frontend numeric enums mirror the backend, so their key names line up. If a name does not line up, the server's 400 message surfaces it (R8).
- **Alternatives considered**: Hard-coding a name list in the settings feature. That duplicates the enums.

## R7. Save model and state

- **Decision**:
  - Each Setting is its own card with its own `FormControl`, and Save and Cancel appear only when the control is dirty.
  - The page holds `settings = signal<Setting[]>`, `loading`, `loadError` and a per-key `saving` set.
  - When a save succeeds, the page replaces that Setting with the returned DTO and resets the control to the returned value (FR-010, SC-003). A success toast follows.
- **Rationale**: The API updates one key per request and the last write wins. Per-card saving keeps a failure contained to its card.
- **Alternatives considered**: A single "Save all" button. It would need several requests that can partly fail, so it was rejected.

## R8. Error handling

- **Decision**:
  - The global `errorInterceptor` already shows a toast with the server's `message` or `errors` for 400, 404 and 500.
  - The component also keeps the `HttpErrorResponse.error.message` (or `errors[0]`) and shows it inline next to the card, inside an `aria-live` region.
  - A load failure produces the page-level error state with Try again, and its message is taken from the response.
  - On a 404 during save, the page reloads the list.
- **Rationale**: Keeping the global toast matches every other page. The inline message satisfies FR-011, so the user does not have to read a toast that disappears.
- **Alternatives considered**: An `HttpContextToken` to suppress the toast. It is a new cross-cutting mechanism with no prior use in the codebase. Deferred: if the duplicate message is judged noisy, add it later.

## R9. Unsaved-edit warning (FR-019)

- **Decision**:
  - Add a functional `canDeactivate` guard on the `app-settings` route. It calls the component's `hasUnsavedChanges()` and asks for confirmation through a PrimeNG `p-confirmdialog`, using a Promise.
  - Add a `beforeunload` host listener for tab close and reload.
- **Rationale**: These are Angular's native mechanisms, with no new dependency. The confirmation stays in the Warm Paper dialog style instead of `window.confirm`.
- **Alternatives considered**: `window.confirm`. It is simpler, but it ignores the design system and blocks browser automation.

## R10. Readable names

- **Decision**:
  - A frozen `SETTING_META` map keyed by lowercased key gives `{ label, group, help, validators? }`.
  - Groups are "New System Users" for `DefaultExpectedHours` and "Hours summary exclusions" for the four lists.
  - An unknown key gets a label made from its key ("SomeNewKey" becomes "Some new key") and goes in an "Other" group, rendered with the server `description`.
- **Rationale**: This covers the spec's edge case for unknown Settings, and keys are looked up without regard to case, the same as on the server.

## R11. Testing

- **Decision**:
  - Write Vitest unit specs next to the source:
    - `settings.service.spec.ts`, which checks URLs and unwrapping against `HttpTestingController`.
    - Tests for the pure helpers, `setting-meta`, label fallback and enum-name mapping.
    - A component spec for load, error, save success, the 400 inline message, Cancel, and role-filtered tabs.
  - A manual pass follows [quickstart.md](quickstart.md).
- **Rationale**: `npm test` exists, but the repo currently has no specs. Pure helpers and the service are the cheapest seams that give real coverage.

## T001 findings (PrimeNG 21.1.7, checked against the installed type definitions)

- `p-inputnumber`: `inputId`, `ariaLabel`, `ariaLabelledBy`, `minFractionDigits`, `maxFractionDigits`, `useGrouping` and `mode` all exist. `min` and `max` are signal inputs inherited from `BaseInput`. The editor uses it as planned.
- `p-multiselect`: `inputId`, `filter`, `filterPlaceHolder`, `display: 'chip'`, `optionLabel`, `optionValue` and `appendTo` all exist. The editor uses it as planned.
- `p-autocomplete` does support `multiple` together with `typeahead=false` (and `addOnBlur`, `separator`, `unique`). **Deviation from R5**: the `StringList` editor uses a native input with an Add button above our own chip list (each chip has a labelled Remove button) instead. Reason: the 60-entry list needs a local filter, a bounded scroll region and case-insensitive duplicate rejection with an announced notice. Hiding chips inside `p-autocomplete` isn't possible, and its `unique` option is case-sensitive.
- `p-confirmdialog` and `ConfirmationService`: `acceptLabel`, `rejectLabel`, `acceptButtonProps`, `rejectButtonProps` and `defaultFocus` are available. They are used by the unsaved-changes guard.
