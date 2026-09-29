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
