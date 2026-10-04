# Contract: Settings API (consumed)

**Source**: ShuraSolutions/SheenTracker-BE PR #5. The relevant files are `SettingsController.cs`, `SettingResponseDto.cs`, `UpdateSettingRequestDto.cs` and `SettingValueValidator.cs`.

**Base**: `environment.apiUrl`, via `ApiService`. Every call is authenticated by the existing `authInterceptor`, and every action requires the **SuperAdmin** role.

## Envelope

Every response uses the same envelope. It matches the one the Squads endpoints use:

```json
{ "success": true, "statusCode": 200, "message": "…", "data": <T>, "errors": [] }
```

Failures set `success: false` and `data: null`, and put a human-readable message in `message`, `errors`, or both.

## SettingResponseDto

```json
{
  "key": "DefaultExpectedHours",
  "value": 8,
  "type": "Decimal",
  "description": "Expected Hours a new System User starts with",
  "updatedAt": "2026-09-30T12:00:00+00:00"
}
```

`value` is typed JSON. For example:

```json
{ "key": "ExcludedDepartments", "value": ["QualityAssurance", "HumanResources"], "type": "DepartmentList", … }
```

## Endpoints

| Method | Path | Body | 200 `data` | Errors |
|---|---|---|---|---|
| GET | `settings` | none | `SettingResponseDto[]` | 403 (not SuperAdmin), or 500 naming the key when a stored row is invalid, e.g. `"Setting 'X': …"` |
| GET | `settings/{key}` | none | `SettingResponseDto` | 404 `"Setting not found."`, 403, or 500 naming the key |
| PUT | `settings/{key}` | `{ "value": <typed JSON> }` | `SettingResponseDto` (normalized), message `"Setting updated successfully."` | 404 unknown key; 400 with `message` naming the problem (see below); 403 |

The `{key}` path segment is matched without regard to case. Pass it through `encodeURIComponent`.

## Value rules the server enforces on PUT (400 if broken)

| Type | Must be | Rejected |
|---|---|---|
| `String` | JSON string | anything else |
| `Int` | JSON integer within the Int32 range | quoted number, fraction |
| `Decimal` | JSON number | quoted number such as `"6.5"` |
| `Bool` | `true` or `false` | `"true"`, `1`, `0` |
| `*List` | JSON array of strings | null items, non-string items, blank items |
| `DepartmentList` / `SeniorityList` | each item a Department or Seniority enum name (case-insensitive) | unknown names such as `"Marketing"` |
| key `DefaultExpectedHours` | 0 to 24, at most 2 decimal places | `65`, `7.555` |

**Normalization**: the server trims list items, removes duplicates without regard to case (keeping the first), and returns enum names in canonical form (`qualitycontrol` becomes `QualityControl`). The client MUST render the returned value.

**Not available**: POST and DELETE. The key, type and description cannot be changed. `updatedBy` is stored but not returned.

## Client service surface (frontend)

```ts
getAll(): Observable<Setting[]>                          // GET settings → data
get(key: string): Observable<Setting>                    // GET settings/{key} → data
update(key: string, value: SettingValue): Observable<Setting> // PUT settings/{key} { value } → data
```
