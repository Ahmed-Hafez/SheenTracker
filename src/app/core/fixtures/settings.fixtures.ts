import { Setting, SettingValue } from '../models/reponse/settings.response.model';
import { Department } from '../enums/departments.enum';
import { Seniority } from '../enums/seniority.enum';
import { fail, FixtureResult, FixtureRoute, ok } from './fixture.model';

/**
 * In-memory copy of the backend Settings table (SheenTracker-BE PR #5). Edits last until reload.
 * PUT mirrors the server's rules from `SettingValueValidator`, so the UI's 400 paths can be exercised.
 */
const DISPLAY_NAMES = [
  ...Array.from({ length: 56 }, (_, i) => `Employee ${String(i + 1).padStart(2, '0')}`),
  'Build Bot',
  'Release Pipeline',
  'Test Runner',
];

const store: Setting[] = [
  setting('DefaultExpectedHours', 'Decimal', 8, 'Expected Hours a new System User starts with.'),
  setting('ExcludedDisplayNames', 'StringList', DISPLAY_NAMES, null),
  setting(
    'ExcludedDisplayNameContains',
    'StringList',
    ['Build Service', 'Project Collection'],
    null,
  ),
  setting('ExcludedDepartments', 'DepartmentList', ['HumanResources'], null),
  setting('ExcludedSeniorities', 'SeniorityList', [], null),
];

export const settingsFixtures: FixtureRoute[] = [
  { method: 'GET', path: 'settings', handle: () => ok(store.map(copy)) },
  {
    method: 'GET',
    path: 'settings/:key',
    handle: ({ params }) => {
      const found = find(params['key']);
      return found ? ok(copy(found)) : fail(404, 'Setting not found.');
    },
  },
  {
    method: 'PUT',
    path: 'settings/:key',
    handle: ({ params, body }) => {
      const found = find(params['key']);
      if (!found) return fail(404, 'Setting not found.');
      const parsed = validate(found, (body as { value?: unknown } | null)?.value);
      if ('status' in parsed) return parsed;
      found.value = parsed.value;
      found.updatedAt = new Date().toISOString();
      return ok(copy(found), 'Setting updated successfully.');
    },
  },
];

function validate(target: Setting, value: unknown): { value: SettingValue } | FixtureResult {
  const invalid = (reason: string) => fail(400, `Setting '${target.key}': ${reason}`);
  switch (target.type) {
    case 'String':
      return typeof value === 'string' ? { value } : invalid('value must be a JSON string.');
    case 'Bool':
      return typeof value === 'boolean' ? { value } : invalid('value must be JSON true or false.');
    case 'Int':
      return Number.isInteger(value)
        ? { value: value as number }
        : invalid('value must be a JSON integer within the Int32 range.');
    case 'Decimal': {
      if (typeof value !== 'number') return invalid('value must be a JSON number.');
      const isHours = target.key.toLowerCase() === 'defaultexpectedhours';
      if (isHours && (value < 0 || value > 24 || Math.round(value * 100) !== value * 100)) {
        return invalid(
          'Default Expected Hours must be between 0 and 24 with at most two decimal places.',
        );
      }
      return { value };
    }
    default: {
      if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
        return invalid('value must be a JSON array of strings.');
      }
      const seen = new Set<string>();
      const items: string[] = [];
      for (const raw of value as string[]) {
        const item = raw.trim();
        if (!item) return invalid('list items must not be blank.');
        if (!seen.has(item.toLowerCase())) {
          seen.add(item.toLowerCase());
          items.push(item);
        }
      }
      const names = enumNames(target.type);
      if (!names) return { value: items };
      const canonical: string[] = [];
      for (const item of items) {
        const name = names.find((n) => n.toLowerCase() === item.toLowerCase());
        if (!name) {
          const kind = target.type === 'DepartmentList' ? 'Department' : 'Seniority';
          return invalid(`'${item}' is not a ${kind} name.`);
        }
        canonical.push(name);
      }
      return { value: canonical };
    }
  }
}

function enumNames(type: Setting['type']): string[] | null {
  const source =
    type === 'DepartmentList' ? Department : type === 'SeniorityList' ? Seniority : null;
  return source ? Object.keys(source).filter((k) => Number.isNaN(Number(k))) : null;
}

function setting(
  key: string,
  type: Setting['type'],
  value: SettingValue,
  description: string | null,
): Setting {
  return { key, type, value, description, updatedAt: '2026-09-30T12:00:00+00:00' };
}

function find(key: string): Setting | undefined {
  return store.find((s) => s.key.toLowerCase() === key.toLowerCase());
}

function copy(s: Setting): Setting {
  return { ...s, value: Array.isArray(s.value) ? [...s.value] : s.value };
}
