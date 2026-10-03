# Data Model: App Settings (Admin)

All of these are client-side types. The server owns persistence. The wire shapes are in [contracts/settings-api.md](contracts/settings-api.md).

## SettingType

The type is a string name, never a number:

`'String' | 'Int' | 'Decimal' | 'Bool' | 'StringList' | 'DepartmentList' | 'SeniorityList'`

## SettingValue

| Type | Value |
|---|---|
| `String` | `string` |
| `Int`, `Decimal` | `number` |
| `Bool` | `boolean` |
| `StringList`, `DepartmentList`, `SeniorityList` | `string[]` |

## Setting (response DTO)

| Field | Type | Notes |
|---|---|---|
| `key` | `string` | Unique. Matched without regard to case, and compared lowercased on the client. |
| `value` | `SettingValue` | Typed JSON. Never a JSON string that has to be parsed again. |
| `type` | `SettingType` | Picks the editor. |
| `description` | `string \| null` | Comes from the database maintainer. Shown when the frontend has no help text for the key. |
| `updatedAt` | `string` (ISO 8601, with offset) | Shown as "Last updated". |

The server does not return `updatedBy`, so it is not displayed.

## UpdateSettingRequest

`{ value: SettingValue }`. It has the same shape the read returns.

## SettingMeta (frontend only)

| Field | Type | Notes |
|---|---|---|
| `label` | `string` | For example "Default Expected Hours" or "Excluded display name fragments". |
| `group` | `'newUsers' \| 'exclusions' \| 'other'` | Sets the heading of the section the Setting appears in. |
| `help` | `string` | Plain-language effect, required by FR-015. |
| `min`, `max`, `maxFractionDigits` | `number?` | Only `DefaultExpectedHours` has these: 0, 24 and 2. |

Known keys:

| Key | Group | Label |
|---|---|---|
| `DefaultExpectedHours` | newUsers | Default Expected Hours |
| `ExcludedDisplayNames` | exclusions | Excluded display names |
| `ExcludedDisplayNameContains` | exclusions | Excluded display name fragments |
| `ExcludedDepartments` | exclusions | Excluded departments |
| `ExcludedSeniorities` | exclusions | Excluded seniorities |

Any unknown key goes in the `other` group, with a label made from its key.

## Validation rules (client side; the server re-checks everything)

- **Decimal or Int**: required. For `DefaultExpectedHours` the value must be from 0 to 24 with at most two decimal places. Out-of-range input blocks Save (FR-007).
- **StringList**: trim each entry and ignore blank ones. Duplicates are caught without regard to case, and the input refuses to add one. An empty list is allowed (FR-013).
- **DepartmentList and SeniorityList**: entries can only come from the known enum names, because the multi-select prevents anything else. An empty list is allowed.
- **After saving**: the displayed value is always the server's returned value, because the server may have normalized it.

## Per-card UI state

`pristine → dirty → saving → (pristine with the server value | dirty with an inline error)`

- **Cancel**: dirty returns to pristine, reset to the last saved value.
- **A save that returns 404**: the page reloads the whole list.
- **Page state**: `loading`, then `loaded` or `loadError`. Try again goes back to `loading`.
