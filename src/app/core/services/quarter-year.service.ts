import { Injectable } from '@angular/core';
import { DateHelpers, DateRange } from '../utils/date-helpers';

export type QuarterLabel = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface QuarterDateRange {
  quarter: string;
  dateRange: DateRange;
}

@Injectable({
  providedIn: 'root',
})
export class QuarterYearService {
  getCurrentQuarter(): QuarterDateRange {
    const normalizedDate = DateHelpers.toDateOnly(new Date());
    const quarterIndex = Math.floor(normalizedDate.getMonth() / 3);
    const quarter = `Q${quarterIndex + 1}` as QuarterLabel;
    const start = new Date(normalizedDate.getFullYear(), quarterIndex * 3, 1);
    const end = new Date(normalizedDate.getFullYear(), quarterIndex * 3 + 3, 0);

    return {
      quarter: `Q${quarterIndex + 1} ${normalizedDate.getFullYear()}`,
      dateRange: {
        start: DateHelpers.toDateOnly(start),
        end: DateHelpers.toDateOnly(end),
      },
    };
  }

  // Get available quarters from 2026 to the current quarter
  getAvailableQuarters(): QuarterDateRange[] {
    const currentYear = new Date().getFullYear();
    const quarters: QuarterDateRange[] = [];

    for (let year = 2026; year <= currentYear; year++) {
      for (let quarter = 1; quarter <= 4; quarter++) {
        const start = new Date(year, (quarter - 1) * 3, 1);
        const end = new Date(year, quarter * 3, 0);
        quarters.push({
          quarter: `Q${quarter} ${year}`,
          dateRange: {
            start: DateHelpers.toDateOnly(start),
            end: DateHelpers.toDateOnly(end),
          },
        });
      }
    }

    const today = DateHelpers.toDateOnly(new Date());
    const q3_2026Start = new Date(2026, 6, 1);

    // Include quarters that have started (up to and including the current quarter)
    // and exclude anything before Q3 2026
    return quarters.filter((quarter) => {
      return quarter.dateRange.start <= today && quarter.dateRange.start >= q3_2026Start;
    });
  }
}
