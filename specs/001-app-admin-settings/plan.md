# Implementation Plan: App Settings (Admin)

**Branch**: `feature/app-settings` | **Date**: 2026-10-03 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/001-app-admin-settings/spec.md`

## Summary

Add a Super Admin-only **App Settings** tab to Settings, after Users & Permissions. It lists the five backend Settings from PR #5 in two groups: Default Expected Hours, and the four hours-summary exclusion lists. Each Setting gets an editor that fits its type and is saved on its own through `PUT /api/settings/{key}`. After a save the card shows the value the server returned.

Access is controlled in two places, both driven by `PAGE_ROLES`:
- a route guard on the new tab
- a role-filtered tab list

## Technical Context

**Language/Version**: TypeScript ~5.9, Angular 21 (standalone, signals, OnPush)

**Primary Dependencies**: PrimeNG 21, chosen per field:
- `p-inputnumber` for numbers
- `p-autocomplete` in multiple mode for text lists
- `p-multiselect` for department and seniority lists
- `p-toggleswitch` for yes/no values
- `p-confirmdialog` for the unsaved-changes prompt

Also Tailwind 4, Reactive Forms and RxJS.

**Storage**: none on the client. The backend `Settings` table, reached through `ApiService`, is the source of truth.

**Testing**: Vitest through `@angular/build:unit-test` (jsdom), with `HttpTestingController` for the service.

**Target Platform**: modern desktop and mobile browsers. Layout down to 390px.

**Project Type**: web SPA (frontend only; the backend already exists).

**Performance Goals**: one GET when the tab loads and one PUT per save. No polling or caching.

**Constraints**:
- WCAG AA, with zero axe violations.
- Follow the Ember Ledger design: Warm Paper surfaces, Deep Amber primary button, and the existing tab row.
- No backend changes.

**Scale/Scope**: 5 Settings today, with display-name lists of about 60 entries. One new route and one feature component, plus a few small pieces (see Project Structure).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

`.specify/memory/constitution.md` is still the unfilled template, so no ratified principles apply. As a substitute, these gates are taken from the project rules in `CLAUDE.md` and `.github/copilot-instructions.md`:

| Gate | Status |
|---|---|
| Standalone components, OnPush, `input()`/`output()`, signals and `computed`, native control flow, no `ngClass`/`ngStyle` | ✅ planned |
| Every request goes through `ApiService` | ✅ new `SettingsService` |
| Every authenticated route has `roleGuard` and a title `'<Page> - SheenTrack 360°'` | ✅ `roleGuard(PAGE_ROLES.appSettings)`, title `'App Settings - SheenTrack 360°'` |
| No `any` | ✅ typed DTOs (existing services use `any`, but this one will not) |
| Reactive forms | ✅ one `FormControl` per Setting |
| axe-clean, WCAG AA | ✅ labelled editors, `aria-live` errors, keyboard reachable (quickstart #14) |

**Result**: PASS before research and PASS after design. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-app-admin-settings/
├── spec.md
├── plan.md              # this file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/
│   └── settings-api.md  # Phase 1
├── checklists/requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
src/app/
├── app.routes.ts                                   # + settings child 'app-settings' (roleGuard, canDeactivate, title)
├── core/
│   ├── utils/roles.util.ts                         # + PAGE_ROLES.appSettings = [SUPER_ADMIN]
│   ├── models/reponse/settings.response.model.ts   # NEW: SettingType, SettingValue, Setting
│   ├── models/request/update-setting.request.model.ts  # NEW
│   ├── http/backend_service/settings.service.ts    # NEW: getAll / get / update
│   └── guards/unsaved-changes.guard.ts             # NEW: functional canDeactivate
└── features/settings/
    ├── base-settings/settings.component.ts         # sections gain `roles`; computed visibleSections via hasRole
    └── app-settings/                               # NEW
        ├── app-settings.component.{ts,html,scss}   # page: load/error states, groups, per-card save
        ├── setting-meta.ts                         # SETTING_META, labelFor(key), enum name ↔ label options
        └── components/setting-editor/              # one card: label, help, typed control, Save/Cancel, inline error
            └── setting-editor.component.{ts,html,scss}
```

Specs go next to their sources:
- `settings.service.spec.ts`
- `setting-meta.spec.ts`
- `app-settings.component.spec.ts`

**Structure Decision**: The code follows the existing Angular layout:
- the feature folder holds the page component, with its sub-components in `components/`
- shared HTTP code and models go in `core/`

The page owns the list, load and error state, and the save calls. Each `setting-editor` is presentational. It takes `setting` and `saving` as inputs and emits `save(value)`. The page passes the server error back to the card as an input.

## Key Design Decisions

The reasons for each are in [research.md](research.md).

1. **Access** (R3)
   - `PAGE_ROLES.appSettings` drives three things:
     - the route guard, which blocks direct URLs before any request is made
     - the tab filter
     - nothing in the sidebar, since the Settings sidebar entry stays on `PAGE_ROLES.settings`
   - The landing redirect stays on `users-permissions`.
2. **Editors by `type`** (R5): use `p-inputnumber`, `p-autocomplete` in multiple mode (chips, no typeahead) and `p-multiselect` (filterable, with labels from `Departments` and `Seniorities` and enum names as the values). Long lists get an entry count and a local filter.
3. **Saving** (R7): each card is saved on its own. A successful save replaces the Setting with the returned DTO and resets the control. A 404 reloads the list.
4. **Errors** (R8): the interceptor's toast stays. The server message is also shown inline on the card (in an `aria-live` region). A failed load shows a page error state with Try again.
5. **Unsaved edits** (R9): a functional `canDeactivate` guard with `p-confirmdialog`, plus `beforeunload`.

## Complexity Tracking

No constitution violations to justify.
