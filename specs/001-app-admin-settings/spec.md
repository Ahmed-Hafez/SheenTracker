# Feature Specification: App Settings (Admin) in the Settings Screen

**Feature Branch**: `feature/app-settings`

**Created**: 2026-10-03

**Status**: Draft

**Input**: User description: "i want to create an app/admin settings in the settings screen to get the contract and the backend method and so on check this pr changes https://github.com/ShuraSolutions/SheenTracker-BE/pull/5"

**Backend source**: ShuraSolutions/SheenTracker-BE PR #5 "Add Settings Table" (merged 2026-09-30). That PR delivers the stored business values and the read and update operations. It explicitly excludes frontend work, and this feature is that frontend work.

## Background

Some business values used to be fixed in server configuration, so changing them required a developer and a redeploy. The backend now stores them as **Settings**, which an administrator can change while the system is running. Five Settings exist:

| Setting | What it controls | Kind of value |
|---|---|---|
| Default Expected Hours | The Expected Hours per working day a new System User starts with when none is given at creation | Number from 0 to 24, at most two decimal places |
| Excluded Display Names | Exact Azure DevOps display names kept out of the hours summary (e.g. bots, people who should not appear) | List of text |
| Excluded Display Name Fragments | Parts of display names that exclude every match from the hours summary (e.g. "Build Service") | List of text |
| Excluded Departments | Departments whose System Users are kept out of the hours summary | List of known departments |
| Excluded Seniorities | Seniorities whose System Users are kept out of the hours summary | List of known seniorities |

The set of Settings is fixed by the database maintainer. Administrators can change only their values. Settings cannot be created, renamed, retyped or deleted from the app.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the values the system runs on (Priority: P1)

A Super Admin opens Settings → App Settings and sees every Setting. For each one they see a plain-language name, what it controls, its current value, and when it was last changed.

**Why this priority**: Viewing comes first. A Super Admin has to see the current values before changing them, and answering "why is this person missing from the summary?" starts here. It works even before editing exists.

**Independent Test**: Sign in as a Super Admin and open the App Settings tab. All five Settings appear with their current values and last-updated times, and these match what the server holds.

**Acceptance Scenarios**:

1. **Given** a Super Admin is signed in, **When** they open Settings → App Settings, **Then** every Setting is listed with its name, description, current value and last-updated date and time.
2. **Given** a list Setting holds an empty list, **When** it is displayed, **Then** it clearly reads as "excludes nobody" rather than appearing blank or broken.
3. **Given** the Settings cannot be loaded (network failure or server error), **When** the tab opens, **Then** an error state explains the problem and offers Try again. Neither an empty list nor stale values are shown.
4. **Given** one stored Setting is invalid on the server, **When** the tab loads, **Then** the error message from the server, which names the problem Setting, is shown so the Super Admin can report it.

---

### User Story 2 - Change Default Expected Hours (Priority: P1)

A Super Admin changes the Expected Hours that new System Users start with, for example from 8 to 7.5, and saves. The new value applies to System Users created from then on.

**Why this priority**: This removes a recurring manual correction. Without it, System Users created without Expected Hours need fixing afterwards.

**Independent Test**: Change the value to 7.5 and save. Reload: it shows 7.5 with a new last-updated time.

**Acceptance Scenarios**:

1. **Given** the Super Admin enters a number from 0 to 24 with at most two decimal places, **When** they save, **Then** the value is stored, a success confirmation appears, and the displayed value and last-updated time refresh.
2. **Given** the Super Admin enters a value below 0, above 24, with more than two decimal places, or not a number, **When** they try to save, **Then** the input is flagged with a message stating the allowed range, and nothing is sent.
3. **Given** the server rejects a value, **When** the save completes, **Then** the server's message is shown next to the field and the previously saved value is kept.
4. **Given** the Super Admin is editing, **When** they read the field's help text, **Then** it states that the change applies only to System Users created afterwards, and existing System Users are unaffected.

---

### User Story 3 - Edit who is excluded from the hours summary (Priority: P2)

A Super Admin adds or removes entries in the four exclusion lists: exact display names, display-name fragments, departments and seniorities. The hours summary reflects the change on its next load, with no redeploy.

**Why this priority**: Exclusions change as people join and leave. Being able to edit them is the main reason the values moved out of configuration. It ranks below P1 only because viewing and Default Expected Hours deliver value on their own.

**Independent Test**: Add a display name to Excluded Display Names and save. Reload the tab and the name persists. On the next load of the Dashboard hours summary, that person no longer appears.

**Acceptance Scenarios**:

1. **Given** a text list Setting (display names or fragments), **When** the Super Admin adds entries, removes entries and saves, **Then** the saved list is shown as the server stored it: entries trimmed, duplicates removed (ignoring capitalization), first occurrence kept.
2. **Given** a department or seniority list, **When** the Super Admin edits it, **Then** they choose only from the known departments or seniorities, shown with readable labels, and cannot enter free text.
3. **Given** a text list, **When** the Super Admin tries to add a blank entry, **Then** it is not added.
4. **Given** any list, **When** the Super Admin removes every entry and saves, **Then** the empty list is accepted, and the UI states that this rule now excludes nobody.
5. **Given** the display-name list holds about sixty entries, **When** it is displayed and edited, **Then** every entry is reachable, and entries can be found and removed without scrolling through a single unbroken line of text.
6. **Given** the Super Admin has unsaved edits to a Setting, **When** they cancel, **Then** the Setting returns to its last saved value.

---

### User Story 4 - Only Super Admins see and change Settings (Priority: P1)

Settings are visible and editable only to Super Admins. Coordination users keep their current Settings experience, Users & Permissions, and never see an app-settings section that would fail for them.

**Why this priority**: Exclusions change what the hours summary reports. The server already refuses every other role, so the UI must not offer anyone else a broken screen.

**Independent Test**: Sign in as a Coordination user and open Settings. No App Settings tab appears, and visiting its address directly does not show the Settings. Then sign in as a Super Admin: the tab is visible.

**Acceptance Scenarios**:

1. **Given** a Coordination user (not a Super Admin), **When** they open Settings, **Then** the App Settings tab is not shown; General and Users & Permissions stay as they are today.
2. **Given** a non-Super Admin enters the App Settings tab's address directly, **When** the page resolves, **Then** they are redirected to Users & Permissions or to the existing forbidden page, and no Settings data is requested.
3. **Given** a Super Admin, **When** they open Settings, **Then** the tabs read General, Users & Permissions, App Settings, in that order.

---

### Edge Cases

- **Concurrent edits**: two Super Admins save the same Setting. The last save wins. After saving, the screen shows the value the server returned, so it reflects what was actually stored.
- **Server normalizes the value**: for example, `qualitycontrol` becomes `QualityControl`, and duplicates or whitespace are removed. The displayed value after saving always comes from the server's response, not from local input.
- **Unknown Setting returned by the server**, for example one added later by the database maintainer: it is still listed, with its raw description and value, and its editor matches its reported kind (text, whole number, decimal, yes/no, list). Nothing on the screen breaks.
- **Setting removed while the screen is open**: saving returns "not found". The screen tells the Super Admin the Setting no longer exists and reloads the list.
- **Session expires mid-edit**: the existing sign-in handling applies, and nothing is saved partially.
- **Slow save**: the Save action shows progress and cannot be pressed twice. The other Settings stay usable.
- **Phone width**: every Setting and editor is usable at 390px wide without horizontal page scrolling.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Settings screen MUST have a new App Settings tab, listed after Users & Permissions, that shows the app's Settings. The existing General and Users & Permissions tabs MUST stay unchanged.
- **FR-002**: The App Settings tab and its data MUST be available only to Super Admins. Other roles MUST NOT see the tab, MUST NOT be able to reach it by address, and MUST NOT trigger any Settings request.
- **FR-003**: Coordination users MUST keep their current access to Users & Permissions. Opening Settings MUST keep its current landing tab for every role.
- **FR-004**: For each Setting, the system MUST show a human-readable name, its description, its current value and its last-updated date and time.
- **FR-005**: Each Setting MUST be edited with a control that fits its kind: a decimal number field for Default Expected Hours; a multi-entry text list for display names and fragments; a pick-from-known-values multi-select for departments and seniorities. A whole-number field, a text field and a yes/no switch MUST serve any future Setting of those kinds.
- **FR-006**: Department and seniority choices MUST use the same readable labels the rest of the app uses (for example "Mid Level"). They MUST be stored under the canonical names the server expects.
- **FR-007**: Default Expected Hours MUST be checked before saving: 0 to 24 inclusive, at most two decimal places. Invalid input MUST show an inline message and MUST NOT be sent.
- **FR-008**: Each Setting MUST be saved on its own, through an explicit Save action. Saving one Setting MUST NOT change any other.
- **FR-009**: While a save is in progress, its Save action MUST show progress and MUST NOT be pressable again.
- **FR-010**: After a successful save, the system MUST show the value and last-updated time returned by the server, and MUST show a success confirmation.
- **FR-011**: When the server rejects a value, the system MUST show the server's message next to that Setting. The last saved value MUST stay available.
- **FR-012**: The user MUST be able to cancel unsaved edits to a Setting, returning it to its last saved value.
- **FR-013**: An empty list MUST be saveable. It MUST be described as excluding nobody.
- **FR-014**: When Settings fail to load, the tab MUST show an error state with a Try again action. When the server names an invalid Setting, that name MUST appear in the message.
- **FR-015**: Help text for Default Expected Hours MUST state that it applies only to System Users created after the change. Help text for the exclusion lists MUST state that they affect only the hours summary.
- **FR-016**: The screen MUST NOT offer any way to create, rename, retype or delete a Setting.
- **FR-017**: The screen MUST meet WCAG AA and pass automated accessibility checks. Every editor must be labelled, errors must be announced to assistive technology, focus must stay visible, and everything must be reachable by keyboard.
- **FR-018**: The screen MUST follow the app's existing Settings design: the tab row, Warm Paper surfaces, primary-button style, and the empty and error state patterns.
- **FR-019**: Where a user leaves the App Settings tab with unsaved edits, the system MUST warn them before discarding those edits.

### Key Entities

- **Setting**: A business value an administrator can change while the system runs. It has a unique key (matched regardless of capitalization), a value, a kind (text, whole number, decimal, yes/no, text list, department list or seniority list), an optional description, and the time it was last updated. The server also records who updated it last, but does not return that.
- **Report Exclusion**: The four list Settings that keep identities or System Users out of the hours summary, by exact display name, display-name fragment, department, or seniority. They do not apply to other reports.
- **Default Expected Hours**: The decimal Setting giving new System Users their starting Expected Hours per working day, used only when none is given at creation.
- **Department / Seniority**: Fixed sets of known values shared with System User management. List Settings of these kinds accept only these values.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A Super Admin can find and change any Setting in under 1 minute from opening Settings, with no developer involvement or redeploy.
- **SC-002**: 100% of invalid Default Expected Hours entries (out of range, too many decimals, not a number) are stopped before they reach the server.
- **SC-003**: After a save, the displayed value matches the stored value in 100% of cases, including when the server normalized it.
- **SC-004**: Non-Super Admin users see 0 app-settings controls and trigger 0 Settings requests.
- **SC-005**: The App Settings tab passes automated accessibility checks with zero violations, and every editor works with keyboard alone.
- **SC-006**: Requests to change exclusions or Default Expected Hours stop needing a code or configuration change. The target is zero redeploys for these values after release.

## Assumptions

- **Placement**: App settings get their own new tab, App Settings, placed after Users & Permissions. Tab order: General, Users & Permissions, App Settings. The General tab and its empty state are left as they are.
- **Access**: The server allows only Super Admins to read or change Settings. The Settings screen as a whole stays open to Coordination (and to Super Admins, who pass every role gate), but the App Settings tab is restricted to Super Admins. The landing tab when opening Settings does not change.
- **Who changed it**: The server records who last changed a Setting but returns only when. The screen shows "last updated" time only. Showing the author would require a backend change and is out of scope.
- **Saving model**: Each Setting is saved separately rather than all at once, because the server updates one Setting per request and last-save-wins applies per Setting.
- **Names**: Readable names for the five known keys are defined in the app: Default Expected Hours, Excluded Display Names, Excluded Display Name Fragments, Excluded Departments, Excluded Seniorities. Any unknown key falls back to a readable form of its key.
- **Grouping**: The four exclusion lists are presented together as "Hours summary exclusions", separate from Default Expected Hours ("New System Users").
- **Kill switch**: Exclusions can be switched off entirely in server configuration. That switch is not exposed in the app, and the screen does not show its state.
- **Department labels**: Readable department labels come from the app's existing department list. Seniority labels come from the existing seniority list.
- **Dependency**: Each environment must already have the five Setting rows inserted by the database maintainer. Until then the tab shows the load error from FR-014.
- **Out of scope**: creating or deleting Settings; change history beyond last-updated time; showing who made a change; applying Default Expected Hours to existing System Users; exposing the exclusions kill switch; any backend change.
