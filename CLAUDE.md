# SheenTrack 360° (package: sheen-pulse)

Angular 21 SPA for HR / Coordination teams: dashboards, squads, quarter plans, utilization reports, and user/permission management. The backend is a REST API.

## Coding rules
@.github/copilot-instructions.md

## Commands
- `npm start`: dev server on http://localhost:4200
- `npm run start:fixtures`: dev server on http://localhost:4300 with **no backend and no login**; API calls are answered by fixtures (see below)
- `npm run build`: production build. Other builds: `ng build -c staging`, `ng build -c uat`, `ng build -c development`
- `npm test`: Vitest through `@angular/build:unit-test` (jsdom, `vitest/globals`). Tests go next to their source as `*.spec.ts`.
- `npx prettier --write <file>`: formatting. A Claude hook runs this automatically after every edit.

## Architecture
- `src/app/core/`: everything shared that isn't UI
  - `http/api_services/api.service.ts`: base `ApiService` that wraps HttpClient. All requests go through it.
  - `http/backend_service/*.service.ts`: one service per backend area, built on `ApiService`
  - `guards/`: `authGuard`, `guestGuard`, `roleGuard(['HR' | 'Coordination' ...])`, which redirects to `/forbidden`
  - `interceptors/`: `errorInterceptor` and `authInterceptor`, registered in `app.config.ts`
  - `models/request`, `models/reponse` (the folder name really is misspelled): DTOs
  - `mock/`: mock data, `pipes/`, `utils/`, `services/` (date, quarter-year, refresh, sidebar)
- `src/app/features/<name>/`: one folder per route-level page. Sub-components go in `components/`.
- `src/app/shared/`: reusable presentational components (badges, cards, dialogs)
- `src/app/layout/`: app shell (sidebar and layout)
- Routing is in `app.routes.ts`. Protect every authenticated page with `roleGuard`, and give each route a `title` of `'<Page> - SheenTrack 360°'`.
- UI: PrimeNG 21 (theme preset in `src/primeng-preset.ts`), Tailwind 4, ECharts via `ngx-echarts`, PrimeIcons and Font Awesome

## Fixtures (fake API for new features)
- `src/app/core/fixtures/`: one `<area>.fixtures.ts` per backend area, exporting `FixtureRoute[]`. Register each file in `fixtures/index.ts`.
- A route is `{ method, path: 'settings/:key', handle }`:
  - `path` is relative to `apiUrl`, and matching ignores case.
  - `handle` returns `ok(data)` or `fail(status, message)` from `fixture.model.ts`. Both use the backend's `ApiResponse` envelope.
  - Keep state in a module-level array, so edits persist until reload.
  - Mirror the server's validation, so the UI's 400 paths can be tested.
- Fixture mode starts a fake session on every load, using the roles in `src/environments/environment.fixtures.ts` (default `SuperAdmin`). Change them to test another role. Logging out and back in with any email and password works.
- A call without a fixture fails with 501, naming the call in a toast.
- Every new feature that adds or changes endpoints MUST ship its fixture file, built from the backend contract (PR, DTOs). The feature should be fully usable under `npm run start:fixtures`.
- Fixtures exist only in that build: the `fixtures` configuration swaps `fixtures/provide-fixtures.ts` (empty exports) for `provide-fixtures.enabled.ts`, so no other build contains fixture or fake-login code. Never import fixture files from app code.

## Gotchas
- `ApiService` hardcodes `apiUrl` instead of reading `environment.apiUrl`. Keep that in mind when you change environment config.
- Per-environment settings live in `src/environments/environment*.ts`. `angular.json` swaps them in with fileReplacements.
- For PrimeNG, Tailwind 4, and ECharts APIs, check current docs through the context7 MCP. For Angular guidance, use the angular-cli MCP.
