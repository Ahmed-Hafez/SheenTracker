# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Internal Sheen Information Technology staff. Two primary audiences, equal weight:

- **HR**: checks who is logging hours, who is inactive, and how each person's utilization compares with what is expected.
- **Coordination**: manages squads, finds utilization gaps across people, squads, and projects, and administers users and permissions in Settings.

Secondary audiences:

- **Business** and **ProjectManager**: use Quarter Plans only.
- **SuperAdmin**: passes every role gate. The only role that sees All Metrics.

## Product Purpose

SheenTrack 360° gives Sheen one place to compare the effort people actually log against what is expected of them, and to plan and track the quarter. It rests on two equal pillars:

1. **Workforce utilization visibility**: actual hours from Azure DevOps against expected and target hours, per person, squad, and project.
2. **Enterprise quarterly planning**: quarter plans broken into epics and metrics, tracked over the quarter.

Success means gaps show up fast: missing hours, inactive users, people or squads carrying too much or too little, and quarter plans falling behind.

## Positioning

The product joins Azure DevOps actuals with Sheen's own expectations (expected and target hours, holidays, squad membership, roles) and with its quarter plans. Azure DevOps alone shows logged work but not whether that work meets expectations or plans.

## Operating Context

Desktop-first internal SPA. Routes are in `src/app/app.routes.ts`, and every authenticated page is role-gated with `roleGuard`, which redirects to `/forbidden`.

- **Dashboard**: KPI cards (Total Actual Hours, Users with Hours, Inactive Users, Total Users, Projects Scanned), top contributors, projects workload, target achievement.
- **Users**: Azure Users (expected hours, holiday calculator, target hours), System Users, and User Details (summary, work items, Azure status).
- **Squads** (Coordination): squad list, and squad details with member management.
- **Reports**: Project Utilization.
- **Quarter Plans** (Business, Coordination, ProjectManager): dashboard, All Epics, and All Metrics (SuperAdmin only).
- **Settings** (Coordination): General, and Users & Permissions.

## Capabilities and Constraints

- REST backend. All requests go through `ApiService`.
- Role visibility uses `hasRole`, which lets SuperAdmin bypass the check, and `holdsRole`, which matches literal roles only. Both live in `src/app/core/utils/roles.util.ts`.
- Dense data tables and charts are the main medium.
- Terminology: Actual hours, Expected hours, Target hours, Users with Hours, Inactive Users, Projects Scanned, Squad, Epic, Metric, Quarter.

## Brand Commitments

- The name is **SheenTrack 360°**, and the degree sign is part of it. Page titles follow `'<Page> - SheenTrack 360°'`.
- Owner: Sheen Information Technology. Logo: `public/logo/Logo.png`.
- The login page describes the product as a "workforce intelligence workspace".

## Evidence on Hand

- Mock data is in `src/app/core/mock/`.
- There are no testimonials, customer claims, or published metrics. Do not invent any.

## Product Principles

1. **Accuracy over decoration.** Numbers must be trustworthy and traceable to their source.
2. **Surface gaps, not just totals.** The useful signal is what is missing or out of balance.
3. **Respect role boundaries.** Show each role only what it may see and act on.
4. **Two pillars, neither buried.** Utilization and quarter planning get equal standing.
5. **Internal-tool efficiency.** Pages should be fast to scan and need few clicks for repeat tasks.

## Accessibility & Inclusion

- WCAG AA minimum, and every page must pass AXE checks.
- English UI only. RTL is not required.
