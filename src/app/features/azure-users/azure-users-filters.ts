import { ParamMap } from '@angular/router';

export const MIN_HOURS_RANGE_MAX = 200;

export interface AzureUsersFilters {
  searchTerm: string;
  projects: string[];
  hoursRange: [number, number];
  zeroHoursUsers: boolean;
}

/** Query params for the Azure Users screen. Defaults are omitted so a clean URL means no filter. */
export interface AzureUsersQueryParams {
  search?: string | null;
  projects?: string[] | null;
  minHours?: number | null;
  maxHours?: number | null;
  zeroHours?: '0' | null;
}

/** The slider's upper bound: never below the largest logged total, so no user is hidden by default. */
export function hoursRangeMax(userHours: number[]): number {
  return Math.max(MIN_HOURS_RANGE_MAX, Math.ceil(Math.max(0, ...userHours)));
}

export function filtersFromParams(params: ParamMap, hoursMax: number): AzureUsersFilters {
  const min = Number(params.get('minHours'));
  const max = Number(params.get('maxHours'));
  const maxHours = params.has('maxHours') && Number.isFinite(max) ? max : hoursMax;
  const minHours = params.has('minHours') && Number.isFinite(min) ? min : 0;

  return {
    searchTerm: params.get('search') ?? '',
    projects: params.getAll('projects'),
    // A shared link can carry values past the slider's bounds, so widen it instead of clipping.
    hoursRange: [Math.min(minHours, maxHours), Math.max(minHours, maxHours)],
    zeroHoursUsers: params.get('zeroHours') !== '0',
  };
}

export function paramsFromFilters(
  filters: AzureUsersFilters,
  hoursMax: number,
): AzureUsersQueryParams {
  const [min, max] = filters.hoursRange;
  const search = filters.searchTerm.trim();

  return {
    search: search || null,
    projects: filters.projects.length ? filters.projects : null,
    minHours: min > 0 ? min : null,
    maxHours: max < hoursMax ? max : null,
    zeroHours: filters.zeroHoursUsers ? null : '0',
  };
}

export function sameFilters(a: AzureUsersFilters, b: AzureUsersFilters): boolean {
  return (
    a.searchTerm === b.searchTerm &&
    a.zeroHoursUsers === b.zeroHoursUsers &&
    a.hoursRange[0] === b.hoursRange[0] &&
    a.hoursRange[1] === b.hoursRange[1] &&
    a.projects.length === b.projects.length &&
    a.projects.every((project, index) => project === b.projects[index])
  );
}
