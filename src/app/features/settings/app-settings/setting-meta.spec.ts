import {
  countMatches,
  DEPARTMENT_OPTIONS,
  humanizeKey,
  labelForEnumName,
  metaFor,
  SENIORITY_OPTIONS,
} from './setting-meta';
import { Setting } from '../../../core/models/reponse/settings.response.model';

const make = (key: string, description: string | null = null): Setting => ({
  key,
  value: [],
  type: 'StringList',
  description,
  updatedAt: '2026-09-30T12:00:00+00:00',
});

describe('setting-meta', () => {
  it('humanizes unknown keys', () => {
    expect(humanizeKey('SomeNewKey')).toBe('Some new key');
  });

  it('finds known keys case-insensitively', () => {
    const meta = metaFor(make('defaultexpectedhours'));
    expect(meta.label).toBe('Default Expected Hours');
    expect(meta.group).toBe('newUsers');
    expect(meta.max).toBe(24);
  });

  it('falls back to the key and server description for unknown Settings', () => {
    const meta = metaFor(make('MaxSquadSize', 'Largest squad allowed'));
    expect(meta).toEqual({
      label: 'Max squad size',
      group: 'other',
      help: 'Largest squad allowed',
    });
  });

  it('uses canonical enum names as option values', () => {
    expect(DEPARTMENT_OPTIONS).toContainEqual({
      label: 'Quality Assurance',
      value: 'QualityAssurance',
    });
    expect(SENIORITY_OPTIONS).toContainEqual({ label: 'Mid Level', value: 'MidLevel' });
  });

  it('labels enum names case-insensitively and keeps unknown names', () => {
    expect(labelForEnumName('SeniorityList', 'midlevel')).toBe('Mid Level');
    expect(labelForEnumName('DepartmentList', 'Marketing')).toBe('Marketing');
  });

  it('counts matches the way the backend rules do', () => {
    const users = [
      { displayName: 'Build Bot', department: 'DevOps' },
      { displayName: 'Project Collection Build Service', department: 'DevOps' },
      { displayName: 'Ana Ray', department: 'Backend' },
    ];
    expect(countMatches('exactName', ' build bot ', users)).toBe(1);
    expect(countMatches('exactName', 'Build', users)).toBe(0);
    expect(countMatches('nameContains', 'build', users)).toBe(2);
    expect(countMatches('department', 'devops', users)).toBe(2);
  });
});
