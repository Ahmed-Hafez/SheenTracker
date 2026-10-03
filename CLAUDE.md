# SheenTrack 360° (package: sheen-pulse)

Angular 21 SPA for HR / Coordination teams: dashboards, squads, quarter plans, utilization reports, and user/permission management. The backend is a REST API.

## Coding rules
@.github/copilot-instructions.md

## Commands
- `npm start`: dev server on http://localhost:4200
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

## Gotchas
- `ApiService` hardcodes `apiUrl` instead of reading `environment.apiUrl`. Keep that in mind when you change environment config.
- Per-environment settings live in `src/environments/environment*.ts`. `angular.json` swaps them in with fileReplacements.
- For PrimeNG, Tailwind 4, and ECharts APIs, check current docs through the context7 MCP. For Angular guidance, use the angular-cli MCP.
