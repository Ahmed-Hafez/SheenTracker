import { PlanQuarter } from '../models/reponse/plan-quarter.response';
import {
  formatQuarterDates,
  formatQuarterLabel,
  pickDefaultQuarter,
  quarterDateRange,
} from './plan-quarter';

function quarter(name: string, isCurrent = false): PlanQuarter {
  return {
    name,
    iterationPath: `Enterprise Quarterly Planning\\${name}`,
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    isCurrent,
  };
}

describe('plan-quarter utils', () => {
  it('picks the current quarter', () => {
    const list = [quarter('2026_Q3'), quarter('2026_Q4', true), quarter('2027_Q1')];
    expect(pickDefaultQuarter(list)?.name).toBe('2026_Q4');
  });

  it('falls back to the latest quarter when none is current', () => {
    expect(pickDefaultQuarter([quarter('2026_Q3'), quarter('2026_Q4')])?.name).toBe('2026_Q4');
  });

  it('returns null for an empty list', () => {
    expect(pickDefaultQuarter([])).toBeNull();
  });

  it('formats names as labels', () => {
    expect(formatQuarterLabel('2026_Q3')).toBe('Q3 2026');
    expect(formatQuarterLabel('Custom quarter')).toBe('Custom quarter');
  });

  it('reads dates as local calendar days', () => {
    const range = quarterDateRange(quarter('2026_Q3'));
    expect(range.start.getMonth()).toBe(6);
    expect(range.start.getDate()).toBe(1);
    expect(range.end.getDate()).toBe(30);
    expect(formatQuarterDates(quarter('2026_Q3'))).toBe('Jul 1 – Sep 30');
  });
});
