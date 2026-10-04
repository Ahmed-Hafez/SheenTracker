# Tasks: App Settings (Admin)

**Input**: Design documents from `specs/001-app-admin-settings/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/settings-api.md](contracts/settings-api.md), [quickstart.md](quickstart.md)

**Tests**: The spec does not ask for TDD. A small set of Vitest specs is included in the Polish phase, because research R11 and quickstart "Automated" plan for them.

**Conventions**:
- Angular 21 standalone components with `ChangeDetectionStrategy.OnPush`.
- Use `input()`/`output()`, signals and `computed`, and native `@if`/`@for`.
- No `ngClass`/`ngStyle`, no `any`, and no `standalone: true`.
- Every request goes through `ApiService`.
- Prettier runs automatically after each edit.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1–US4 from spec.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the PrimeNG APIs the editors depend on before writing them.

- [X] T001 Use context7 to confirm three PrimeNG 21 behaviours, and record any deviation as a note at the end of `specs/001-app-admin-settings/research.md`:
  - (a) `p-autocomplete` supports `[multiple]="true"` with `[typeahead]="false"` for free-text chips, and how it exposes `inputId` and `ariaLabel`
  - (b) the `p-inputnumber` inputs `minFractionDigits`, `maxFractionDigits`, `min`, `max`, `inputId` and `ariaLabel`
  - (c) `p-multiselect` with `filter`, `display="chip"` and `inputId`, plus `p-confirmdialog` and `ConfirmationService` usage

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Contract types, the HTTP service, role map entry, route and setting metadata that every story uses.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Create `src/app/core/models/reponse/settings.response.model.ts`:
  - export `type SettingType = 'String' | 'Int' | 'Decimal' | 'Bool' | 'StringList' | 'DepartmentList' | 'SeniorityList'`
  - export `type SettingValue = string | number | boolean | string[]`
  - export `interface Setting { key: string; value: SettingValue; type: SettingType; description: string | null; updatedAt: string }` (updatedAt is ISO 8601 with offset)
  - export a generic `interface ApiEnvelope<T> { success: boolean; statusCode: number; message: string; data: T; errors: string[] | null }`
  - use exactly the shapes in contracts/settings-api.md
- [X] T003 [P] Create `src/app/core/models/request/update-setting.request.model.ts` exporting `interface UpdateSettingRequest { value: SettingValue }`. Import `SettingValue` from the T002 file.
- [X] T004 Create `src/app/core/http/backend_service/settings.service.ts`:
  - `@Injectable({ providedIn: 'root' })`, `inject(ApiService)`, endpoint base `'settings'`
  - `getAll(): Observable<Setting[]>` → `apiService.get<ApiEnvelope<Setting[]>>('settings')` mapped to `.data`
  - `get(key)` → `` `settings/${encodeURIComponent(key)}` `` mapped to `.data`
  - `update(key, value: SettingValue): Observable<Setting>` → `apiService.put<ApiEnvelope<Setting>>(`settings/${encodeURIComponent(key)}`, { value } satisfies UpdateSettingRequest)` mapped to `.data`
  - no `any` (depends on T002, T003)
- [X] T005 [P] In `src/app/core/utils/roles.util.ts`, add `appSettings: [SUPER_ADMIN]` to `PAGE_ROLES`, after `settings`. Leave `settings: ['Coordination']` unchanged.
- [X] T006 [P] Create `src/app/features/settings/app-settings/setting-meta.ts`:
  - `type SettingGroup = 'newUsers' | 'exclusions' | 'other'`
  - `interface SettingMeta { label: string; group: SettingGroup; help: string; min?: number; max?: number; maxFractionDigits?: number }`
  - a frozen `SETTING_META: Readonly<Record<string, SettingMeta>>` keyed by **lowercased** key, with these rows:

    | key | label | group | help | limits |
    |---|---|---|---|---|
    | `defaultexpectedhours` | 'Default Expected Hours' | newUsers | 'Hours per working day a new System User starts with when none is given. Applies only to System Users created after you change it; existing users keep their Expected Hours.' | `min: 0, max: 24, maxFractionDigits: 2` |
    | `excludeddisplaynames` | 'Excluded display names' | exclusions | 'Exact Azure DevOps display names kept out of the hours summary. Other reports are not affected.' | |
    | `excludeddisplaynamecontains` | 'Excluded display name fragments' | exclusions | 'Anyone whose display name contains one of these is kept out of the hours summary, for example "Build Service".' | |
    | `excludeddepartments` | 'Excluded departments' | exclusions | 'System Users in these departments are kept out of the hours summary.' | |
    | `excludedseniorities` | 'Excluded seniorities' | exclusions | 'System Users with these seniorities are kept out of the hours summary.' | |

  - `metaFor(setting: Setting): SettingMeta`: unknown keys get `{ label: humanizeKey(key), group: 'other', help: setting.description ?? '' }`
  - `humanizeKey('SomeNewKey')` → `'Some new key'`
  - `GROUP_TITLES = { newUsers: 'New System Users', exclusions: 'Hours summary exclusions', other: 'Other settings' }`
- [X] T007 Register the route in `src/app/app.routes.ts`:
  - add a settings child **after** `users-permissions`: `{ path: 'app-settings', title: 'App Settings - SheenTrack 360°', canActivate: [roleGuard(PAGE_ROLES.appSettings)], data: { refresh: true } satisfies ShellRouteData, loadComponent: () => import('./features/settings/app-settings/app-settings.component').then((m) => m.AppSettingsComponent) }`
  - leave the `''` redirect pointing to `users-permissions`
  - depends on T005; the component lands in T009, so create a minimal stub component file now if you need the build to pass

**Checkpoint**: The types, service, role entry, metadata and route exist. `npm run build` passes.

---

## Phase 3: User Story 1 — See the values the system runs on (Priority: P1) 🎯 MVP

**Goal**: A Super Admin opens Settings → App Settings and sees every Setting, grouped, with its label, help text, current value and last-updated time, plus loading and error states.

**Independent Test**: Sign in as a Super Admin and open `/settings/app-settings`. The five Settings show values that match `GET /api/settings`. With the backend stopped, the error state appears with Try again (quickstart #3, #11, #12).

- [X] T008 [US1] Create the presentational card `src/app/features/settings/app-settings/components/setting-editor/setting-editor.component.{ts,html,scss}`, in read-only mode for now:
  - inputs `setting = input.required<Setting>()` and `meta = input.required<SettingMeta>()`
  - render a heading (`h3`) with `meta().label`, the help text, and the value:
    - lists: comma-free chips, using department and seniority labels via T006 helpers added in US3. Until then, raw names.
    - an empty list reads **"Excludes nobody"**
    - numbers via `DecimalPipe` `'1.0-2'`
    - bool as Yes/No
  - "Last updated {{ updatedAt | date: 'd MMM y, HH:mm' }}"
  - styles: card on `var(--card-bg)` with a `1px solid var(--charcoal-100)` border and `var(--radius-lg)`, matching `.users-table`; help text 13px `var(--charcoal-600)`
- [X] T009 [US1] Create the page `src/app/features/settings/app-settings/app-settings.component.{ts,html,scss}` (`AppSettingsComponent`, OnPush):
  - signals `settings = signal<Setting[]>([])`, `isLoading`, `loadError = signal<string | null>(null)`
  - `loadSettings()` calls `SettingsService.getAll()`; on error it stores `err.error?.errors?.[0] ?? err.error?.message ?? "Couldn't load settings."`
  - `groups = computed(...)` buckets settings by `metaFor(s).group` in the order newUsers → exclusions → other, and drops empty groups
  - header block in the same style as `users-permissions`: `h2` "App Settings" and the text "Business values the system runs on. Changes apply immediately, with no redeploy."
  - each group renders as a `section` with an `h3` group title and its `app-setting-editor` cards
  - loading state is a skeleton or spinner, with `aria-busy`
  - error state reuses the `.users-empty` pattern: title "Couldn't load settings", the server message, and a **Try again** `btn btn-secondary btn-sm` that calls `loadSettings()`, inside `role="status"`
  - load in `ngOnInit`
- [X] T010 [US1] Wire Refresh in `app-settings.component.ts`: inject `RefreshService` and reload on its refresh signal, following how `users-permissions.component.ts` reacts to `RefreshService`. The route has `data.refresh = true` from T007.

**Checkpoint**: The tab is reachable by URL for a Super Admin, shows all Settings read-only, and handles loading and error states.

---

## Phase 4: User Story 4 — Only Super Admins see and change Settings (Priority: P1)

**Goal**: The App Settings tab appears only for Super Admins and comes third. Other roles cannot reach it and trigger no Settings request.

**Independent Test**: As Coordination, the tabs are General and Users & Permissions, and `/settings/app-settings` goes to `/forbidden` with no `settings` request in the network panel. As Super Admin, the tabs are General, Users & Permissions, App Settings (quickstart #1, #2).

- [X] T011 [US4] In `src/app/features/settings/base-settings/settings.component.ts`:
  - extend `SettingsSection` with `roles: readonly string[]`
  - set the sections to `[{ label: 'General', route: '/settings/general', roles: PAGE_ROLES.settings }, { label: 'Users & Permissions', route: '/settings/users-permissions', roles: PAGE_ROLES.settings }, { label: 'App Settings', route: '/settings/app-settings', roles: PAGE_ROLES.appSettings }]`
  - inject `AuthService` and add `visibleSections = computed(() => this.sections.filter((s) => hasRole(this.auth.getUserData()?.roles ?? [], ...s.roles)))`
  - in `settings.component.html`, iterate `visibleSections()` instead of `sections`
- [X] T012 [US4] Verify the guard path: `roleGuard(PAGE_ROLES.appSettings)` on the T007 route sends non-Super Admins to `/forbidden` before `AppSettingsComponent` is created, so no request is sent. Check that `hasRole` admits a SuperAdmin through its bypass. If a check fails, fix it in `src/app/app.routes.ts` or `src/app/core/guards/role.guard.ts`.

**Checkpoint**: Access is correct for both roles.

---

## Phase 5: User Story 2 — Change Default Expected Hours (Priority: P1)

**Goal**: A Super Admin edits a numeric Setting, with validation for "0 ≤ value ≤ 24, at most two decimal places", and saves it on its own. The card then shows the value the server returned.

**Independent Test**: `25` and `7.555` are blocked inline with no request sent. `7.5` saves, shows a success toast, refreshes Last updated, and survives a reload (quickstart #4, #5, #9).

- [X] T013 [US2] Add edit mode to `setting-editor.component.ts`:
  - new inputs `saving = input(false)` and `serverError = input<string | null>(null)`; new outputs `save = output<SettingValue>()` and `dirtyChange = output<boolean>()`
  - hold a `FormControl<SettingValue>` that is reset from `setting().value` whenever `setting()` changes, using `effect` or `linkedSignal` plus `control.reset`
  - expose `isDirty`
  - **Save** (`btn btn-primary btn-sm`, `type="button"`, disabled while `saving()` or the control is invalid, shows a `pi-spin pi-spinner` while saving) and **Cancel** (`btn btn-secondary btn-sm`, resets to `setting().value`) render only when dirty
  - show `serverError()` in a `p-message severity="error" size="small"` inside an `aria-live="polite"` region
- [X] T014 [US2] Add the numeric editors in `setting-editor.component.html`, using `@switch (setting().type)`:
  - `Decimal` → `p-inputnumber`, with `[inputId]` set to a key-derived id, `[min]`/`[max]` from meta, `[minFractionDigits]="0"`, `[maxFractionDigits]="meta().maxFractionDigits ?? 2"`, `mode="decimal"`, `[useGrouping]="false"`, and a visible `<label>` bound to that id
  - `Int` → the same control with `[maxFractionDigits]="0"`
  - add validators to the control: `Validators.required`, plus `Validators.min(meta.min)` and `Validators.max(meta.max)` when they are defined, plus a two-decimal-place validator when `maxFractionDigits` is set
  - inline messages, wired up through `aria-describedby`:
    - out of range or too precise: "Enter a number from 0 to 24 with up to two decimals."
    - empty: "Enter a value."
- [X] T015 [US2] Add saving in `app-settings.component.ts`:
  - signals `savingKeys = signal<ReadonlySet<string>>(new Set())` and `errors = signal<Record<string, string>>({})`, both keyed by lowercased key
  - `onSave(setting, value)` adds the key to `savingKeys`, clears its error, and calls `SettingsService.update(setting.key, value)`
  - on success it replaces that item in `settings` with the returned DTO (this is required, because the server normalizes values) and adds a `MessageService` success toast: summary 'Setting saved', detail `` `${label} updated.` ``
  - on HTTP 400 it sets `errors[key]` to `err.error?.message ?? err.error?.errors?.[0]`
  - on 404 it sets the error 'This setting no longer exists.' and calls `loadSettings()`
  - it always removes the key from `savingKeys`
  - bind `[saving]`, `[serverError]` and `(save)` on each `app-setting-editor`
  - the global interceptor toast remains (research R8)
- [X] T016 [US2] Show the FR-015 help for Default Expected Hours (already in T006 meta) under the label in edit mode too. Check that the success flow resets the control to pristine, so Save and Cancel hide.

**Checkpoint**: Default Expected Hours is fully editable. US1 and US4 still pass.

---

## Phase 6: User Story 3 — Edit who is excluded from the hours summary (Priority: P2)

**Goal**: Edit the four exclusion lists:
- free-text chip lists for display names and fragments
- multi-selects with labels for departments and seniorities, which send canonical enum names

Empty lists are allowed, and a large list stays manageable.

**Independent Test**:
- `"  Build Bot "` and `"build bot"` save as a single `Build Bot`.
- An empty seniorities list saves and reads "Excludes nobody".
- The department picker shows "Quality Assurance" but sends `"QualityAssurance"` (quickstart #6, #7, #8).

- [X] T017 [P] [US3] In `src/app/features/settings/app-settings/setting-meta.ts`, add the enum option helpers:
  - `DEPARTMENT_OPTIONS = Departments.map((d) => ({ label: d.label, value: Department[d.value] }))` and `SENIORITY_OPTIONS = Seniorities.map((s) => ({ label: s.label, value: Seniority[s.value] }))`, imported from `src/app/core/enums/departments.enum.ts` and `seniority.enum.ts`
  - `labelForEnumName(type, name)` returns the matching label, compared case-insensitively, **or the raw name when there is no match**, so a value is never dropped
- [X] T018 [US3] Add the `StringList` editor in `setting-editor.component.html`:
  - `p-autocomplete` with `[multiple]="true"`, `[typeahead]="false"`, `[inputId]` and a visible label (adjust per the T001 findings)
  - on add, trim the entry and ignore it if it is blank or already present (case-insensitive)
  - show an entry count, "N entries"
  - when there are more than 15 entries, show a "Filter entries" text input (`type="search"` with a label) that hides non-matching chips locally, and put the chips in a region capped at about `max-height: 16rem; overflow-y: auto` so about 60 entries stay manageable
  - when the list is empty, show the hint "Excludes nobody"
- [X] T019 [US3] Add the `DepartmentList` and `SeniorityList` editors in `setting-editor.component.html`:
  - `p-multiselect` with `[options]` from T017, `optionLabel="label"`, `optionValue="value"`, `display="chip"`, `[filter]="true"`, `[inputId]`, a visible label, and `appendTo="body"`
  - any stored name not in the options still shows, via `labelForEnumName`; do not strip unknown values from the control
  - an empty selection shows the hint "Excludes nobody"
- [X] T020 [US3] Update read-mode chip labels in `setting-editor.component.html` to use `labelForEnumName` for department and seniority lists (replacing the raw names from T008). Confirm that after a save the chips show the server-normalized list returned by T015.
- [X] T021 [P] [US3] Add the remaining FR-005 editors for future Settings in `setting-editor.component.html`:
  - `String` → `<input class="field">` with a label
  - `Bool` → `p-toggleswitch` with `[inputId]` and `ariaLabelledBy` pointing at the label

**Checkpoint**: All five Settings are editable. Every story works on its own.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T022 Create `src/app/core/guards/unsaved-changes.guard.ts` (FR-019):
  - define an interface `HasUnsavedChanges { hasUnsavedChanges(): boolean; confirmDiscard(): Promise<boolean> }`
  - add a functional `unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges>` that returns `true` when there are no unsaved changes, and otherwise returns `component.confirmDiscard()`
  - add `canDeactivate: [unsavedChangesGuard]` to the `app-settings` route in `src/app/app.routes.ts`
- [X] T023 Implement `HasUnsavedChanges` in `app-settings.component.ts`:
  - track dirty keys from each editor's `dirtyChange` output
  - `confirmDiscard()` uses `ConfirmationService.confirm`, provided in the component's `providers`, with a `<p-confirmdialog>` styled `{ width: '28rem', backgroundColor: 'var(--page-bg)' }`
    - header: 'Discard unsaved changes?'
    - message: 'Your edits to these settings have not been saved.'
    - accept label 'Discard', reject label 'Keep editing'
  - add `host: { '(window:beforeunload)': 'onBeforeUnload($event)' }`, which calls `preventDefault()` when there are unsaved changes
- [X] T024 [P] Add the responsive and design pass in `app-settings.component.scss` and `setting-editor.component.scss`:
  - single column of cards, `gap: var(--space-lg)`
  - at 390px, Save and Cancel stack full-width and nothing scrolls horizontally
  - Warm Paper page background, Deep Amber primary buttons, and no white text on orange-500 (Readable Ember Rule in DESIGN.md)
- [X] T025 [P] Add `src/app/core/http/backend_service/settings.service.spec.ts`. Use `provideHttpClient()` and `provideHttpClientTesting()`, then check:
  - `getAll` sends a GET to `…settings` and unwraps `data`
  - `update('Default Expected Hours', 7.5)` sends a PUT to `…settings/Default%20Expected%20Hours` with body `{ value: 7.5 }`
- [X] T026 [P] Add `src/app/features/settings/app-settings/setting-meta.spec.ts`, covering:
  - `humanizeKey`
  - `metaFor` for a known key looked up case-insensitively, and for an unknown key
  - `DEPARTMENT_OPTIONS` values are enum names, e.g. `'QualityAssurance'`
  - `labelForEnumName` falls back to the raw name
- [X] T027 Add `src/app/features/settings/app-settings/app-settings.component.spec.ts`, covering:
  - load success renders the groups
  - load failure shows Try again and the server message
  - a save success replaces the value with the server's response
  - a 400 shows the inline message
  - Cancel restores the saved value
- [X] T028 Run `npm test` and `npm run build`, and fix any failures; the build must have 0 errors.
- [ ] T029 Run every scenario in `specs/001-app-admin-settings/quickstart.md`, including the axe scan (#14) and the 390px pass (#13). Fix what fails, then record the results in the quickstart table or PR description.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (T001)** → **Foundational (T002–T007)** → user stories → **Polish**.

### User Story Dependencies

| Story | Depends on | Notes |
|---|---|---|
| US1 (P1) | Foundational | MVP: read-only view |
| US4 (P1) | Foundational | Independent of US1 (tab list and guard). US1 is needed only to *see* the tab content. |
| US2 (P1) | US1 | It extends the editor card and the page from US1. |
| US3 (P2) | US2 | It reuses the edit and save plumbing from T013 and T015. |
| Polish | US2, plus US3 for full coverage | T022 and T023 need the dirty tracking from US2. |

### Within each story

Edit the editor component before the page wiring that binds it.

### Parallel Opportunities

- **Foundational**: T002, T003, T005 and T006 are separate files; T004 follows T002 and T003, and T007 follows T005.
- **After Foundational**: US4 (T011, T012) can proceed in parallel with US1 (T008–T010).
- **US3**: T017 and T021 can start in parallel with T018 and T019, as long as they edit different sections of the template.
- **Polish**: T024, T025 and T026 are separate files.

## Parallel Example: Foundational

```text
T002 settings.response.model.ts
T003 update-setting.request.model.ts
T005 roles.util.ts PAGE_ROLES.appSettings
T006 setting-meta.ts
```

## Parallel Example: After Foundational

```text
Track A (US1): T008 → T009 → T010
Track B (US4): T011 → T012
```

## Implementation Strategy

### MVP first

1. Do T001–T007, then US1 (T008–T010) and US4 (T011–T012). This gives a secure, read-only App Settings tab. Validate it with quickstart #1, #2, #3, #11 and #12.
2. **Stop and demo**: Super Admins can see every business value.

### Incremental delivery

3. US2 (T013–T016) makes Default Expected Hours editable. Validate with quickstart #4, #5 and #9.
4. US3 (T017–T021) makes the exclusion lists editable. Validate with quickstart #6, #7 and #8.
5. Polish (T022–T029) adds the unsaved-changes guard, responsive layout, specs and the full quickstart run.
