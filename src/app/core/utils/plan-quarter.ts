import { PlanQuarter } from '../models/reponse/plan-quarter.response';
import { DateRange } from './date-helpers';

/** The quarter marked current, else the latest one (the list is ordered oldest first). */
export function pickDefaultQuarter(quarters: readonly PlanQuarter[]): PlanQuarter | null {
  return quarters.find((q) => q.isCurrent) ?? quarters.at(-1) ?? null;
}

/** `2026_Q3` becomes `Q3 2026`. Names in any other shape are shown as they are. */
export function formatQuarterLabel(name: string): string {
  const match = /^(\d{4})_Q([1-4])$/i.exec(name);
  return match ? `Q${match[2]} ${match[1]}` : name;
}

/** Start and end as local dates, so `2026-07-01` never shifts to Jun 30 west of UTC. */
export function quarterDateRange(quarter: PlanQuarter): DateRange {
  return { start: parseDateOnly(quarter.startDate), end: parseDateOnly(quarter.endDate) };
}

/** `Jul 1 – Sep 30` */
export function formatQuarterDates(quarter: PlanQuarter): string {
  const { start, end } = quarterDateRange(quarter);
  const format = (date: Date) => date.toLocaleString('en-US', { month: 'short', day: 'numeric' });
  return `${format(start)} – ${format(end)}`;
}

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  return new Date(year, month - 1, day);
}
