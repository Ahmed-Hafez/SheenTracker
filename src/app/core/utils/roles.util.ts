export const SUPER_ADMIN = 'SuperAdmin';

const sameRole = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

export const isSuperAdmin = (roles: string[] = []) => roles.some((r) => sameRole(r, SUPER_ADMIN));

/**
 * True if the user holds any of `allowed`, or is a Super Admin.
 * Use this for every "can the user see / do X" gate.
 */
export const hasRole = (roles: string[] = [], ...allowed: string[]) =>
  isSuperAdmin(roles) || holdsRole(roles, ...allowed);

/**
 * True only if the user literally holds one of `allowed` — no Super Admin bypass.
 * Use this only to *restrict* a user (e.g. "Business-only users land on Quarter Plans"),
 * where treating a Super Admin as that role would take access away from them.
 */
export const holdsRole = (roles: string[] = [], ...allowed: string[]) =>
  roles.some((r) => allowed.some((a) => sameRole(r, a)));

/**
 * Who may open each authenticated page. The route guards and the sidebar both read
 * this map, so navigation can never show a page the guard would refuse.
 */
export const PAGE_ROLES = {
  dashboard: ['HR', 'Coordination'],
  azureUsers: ['HR', 'Coordination'],
  systemUsers: ['Coordination'],
  userDetails: ['HR', 'Coordination'],
  squads: ['Coordination'],
  projectUtilization: ['HR', 'Coordination'],
  quarterPlans: ['Business', 'Coordination', 'ProjectManager'],
  allMetrics: [SUPER_ADMIN],
  settings: ['Coordination'],
  /** The backend refuses every other role on `/api/settings`. */
  appSettings: [SUPER_ADMIN],
} as const satisfies Record<string, readonly string[]>;

/** Plain-language summary of what each role can open, derived from PAGE_ROLES. */
const ROLE_ACCESS: Record<string, string> = {
  superadmin: 'Every page, including All Metrics, and can manage other Super Admins.',
  coordination: 'Every page: Dashboard, Users, Squads, Reports, Quarter Plans and Settings.',
  hr: 'Dashboard, Azure Users, user details and the Project Utilization report.',
  business: 'Quarter Plans only.',
  projectmanager: 'Quarter Plans only.',
};

export const describeRoleAccess = (role: string | null | undefined): string | null =>
  role ? (ROLE_ACCESS[role.toLowerCase()] ?? null) : null;
