import { Department, Departments } from '../../../core/enums/departments.enum';
import { Seniorities, Seniority } from '../../../core/enums/seniority.enum';
import { Setting, SettingType } from '../../../core/models/reponse/settings.response.model';

export type SettingGroup = 'newUsers' | 'exclusions' | 'other';

/** How a list entry is matched against Azure DevOps users, to show who a rule actually hides. */
export type MatchRule = 'exactName' | 'nameContains' | 'department';

/** The fields of an Azure DevOps user that exclusion rules look at. */
export interface MatchUser {
  displayName: string;
  /** Canonical Department enum name, e.g. `QualityAssurance`. */
  department: string | null;
  email?: string;
}

export interface SettingMeta {
  label: string;
  group: SettingGroup;
  /** Plain-language effect of the Setting. */
  help: string;
  min?: number;
  max?: number;
  maxFractionDigits?: number;
  /** Above this, a valid number still gets a "check this" warning. */
  softMax?: number;
  unit?: string;
  match?: MatchRule;
}

export interface EnumOption {
  label: string;
  /** The canonical enum name the backend validates against, e.g. `QualityAssurance`. */
  value: string;
}

/** Exclusions lead: they are why the page exists, and they change what HR's main report shows. */
export const GROUP_ORDER: readonly SettingGroup[] = ['exclusions', 'newUsers', 'other'];

export const GROUP_TITLES: Readonly<Record<SettingGroup, string>> = {
  newUsers: 'New System Users',
  exclusions: 'Hours summary exclusions',
  other: 'Other settings',
};

export const GROUP_DESCRIPTIONS: Readonly<Record<SettingGroup, string>> = {
  exclusions:
    'Anyone matched by at least one rule below is left out of the hours summary. Other reports are not affected.',
  newUsers: 'Used only at the moment a System User is created.',
  other: 'Settings added by the database maintainer.',
};

/** Keyed by lowercased Setting key, because the backend matches keys case-insensitively. */
const SETTING_META: Readonly<Record<string, SettingMeta>> = Object.freeze({
  defaultexpectedhours: {
    label: 'Default Expected Hours',
    group: 'newUsers',
    help: 'Hours per working day a new System User starts with when none is given. Applies only to System Users created after you change it; existing users keep their Expected Hours.',
    min: 0,
    max: 24,
    maxFractionDigits: 2,
    softMax: 12,
    unit: 'hours per working day',
  },
  excludeddisplaynames: {
    label: 'Excluded display names',
    group: 'exclusions',
    help: 'Exact Azure DevOps display names. A name must match exactly to hide anyone.',
    match: 'exactName',
  },
  excludeddisplaynamecontains: {
    label: 'Excluded display name fragments',
    group: 'exclusions',
    help: 'Hides everyone whose display name contains the text, for example "Build Service". Short fragments can match many people.',
    match: 'nameContains',
  },
  excludeddepartments: {
    label: 'Excluded departments',
    group: 'exclusions',
    help: 'Hides System Users in these departments.',
    match: 'department',
  },
  excludedseniorities: {
    label: 'Excluded seniorities',
    group: 'exclusions',
    help: 'Hides System Users with these seniorities.',
  },
});

/** `SomeNewKey` → `Some new key`, for Settings the app has no label for yet. */
export function humanizeKey(key: string): string {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function metaFor(setting: Setting): SettingMeta {
  return (
    SETTING_META[setting.key.toLowerCase()] ?? {
      label: humanizeKey(setting.key),
      group: 'other',
      help: setting.description ?? '',
    }
  );
}

export const DEPARTMENT_OPTIONS: readonly EnumOption[] = Departments.map((d) => ({
  label: d.label,
  value: Department[d.value],
}));

export const SENIORITY_OPTIONS: readonly EnumOption[] = Seniorities.map((s) => ({
  label: s.label,
  value: Seniority[s.value],
}));

export function enumOptionsFor(type: SettingType): readonly EnumOption[] {
  if (type === 'DepartmentList') return DEPARTMENT_OPTIONS;
  if (type === 'SeniorityList') return SENIORITY_OPTIONS;
  return [];
}

/** Readable label for a stored enum name; the raw name when the app doesn't know it, so nothing is hidden. */
export function labelForEnumName(type: SettingType, name: string): string {
  const match = enumOptionsFor(type).find((o) => o.value.toLowerCase() === name.toLowerCase());
  return match?.label ?? name;
}

/** Users whose name or email contains `term`, minus names already in the list, for the add-field dropdown. */
export function suggestUsers(
  users: readonly MatchUser[],
  term: string,
  taken: readonly string[],
  limit = 8,
): MatchUser[] {
  const needle = term.trim().toLowerCase();
  if (!needle) return [];
  const used = new Set(taken.map((name) => name.trim().toLowerCase()));
  return users
    .filter(
      (u) =>
        !used.has(u.displayName.trim().toLowerCase()) &&
        (u.displayName.toLowerCase().includes(needle) || !!u.email?.toLowerCase().includes(needle)),
    )
    .slice(0, limit);
}

/** How many users an entry matches under a rule, compared case-insensitively like the backend. */
export function countMatches(rule: MatchRule, entry: string, users: readonly MatchUser[]): number {
  const needle = entry.trim().toLowerCase();
  return users.filter((user) => {
    if (rule === 'department') return user.department?.toLowerCase() === needle;
    const name = user.displayName.trim().toLowerCase();
    return rule === 'exactName' ? name === needle : name.includes(needle);
  }).length;
}
