/** Which global time control a page actually reads. */
export type DateScope = 'range' | 'quarter' | 'none';

/**
 * Route `data` the app shell reads. Child routes override their parents.
 * - `header`: page name shown in the topbar
 * - `dateScope`: which time control the topbar shows (defaults to `none`)
 * - `refresh`: show the Refresh button (only on pages that listen to RefreshService)
 */
export interface ShellRouteData {
  header?: string;
  dateScope?: DateScope;
  refresh?: boolean;
}
