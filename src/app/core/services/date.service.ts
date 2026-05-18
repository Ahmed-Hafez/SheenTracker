import { Injectable, computed, signal } from '@angular/core';

export interface DateRange {
  start: Date;
  end: Date;
}

@Injectable({
  providedIn: 'root',
})
export class DateService {
  private readonly defaultRange = this.createDefaultRange();
  private readonly selectedDateRangeSignal = signal<DateRange | null>(this.defaultRange);
  readonly selectedDateRange = this.selectedDateRangeSignal.asReadonly();
  readonly selectedDateRangeArray = computed(() => {
    const range = this.selectedDateRangeSignal();
    return range ? [range.start, range.end] : null;
  });

  setDateRange(start: Date, end: Date): void {
    this.selectedDateRangeSignal.set({
      start: this.toDateOnly(start),
      end: this.toDateOnly(end),
    });
  }

  getSelectedDaysCount(range: DateRange | null = this.selectedDateRangeSignal()): number {
    if (!range) {
      return 0;
    }

    const start = this.toDateOnly(range.start);
    const end = this.toDateOnly(range.end);
    const diffMs = end.getTime() - start.getTime();

    if (diffMs < 0) {
      return 0;
    }

    const days = Math.floor(diffMs / 86_400_000) + 1;
    return days;
  }

  isDefaultRangeSelected(range: DateRange | null = this.selectedDateRangeSignal()): boolean {
    if (!range) {
      return false;
    }

    return (
      this.isSameDay(range.start, this.defaultRange.start) &&
      this.isSameDay(range.end, this.defaultRange.end)
    );
  }

  setDateRangeFromArray(rangeDates: Date[] | null | undefined): void {
    if (!rangeDates || rangeDates.length < 2) {
      return;
    }

    const [start, end] = rangeDates;

    if (!(start instanceof Date) || !(end instanceof Date)) {
      return;
    }

    this.setDateRange(start, end);
  }

  clearDateRange(): void {
    this.selectedDateRangeSignal.set(null);
  }

  private createDefaultRange(): DateRange {
    const end = this.toDateOnly(new Date());
    const start = this.toDateOnly(new Date());
    start.setDate(end.getDate() - 29);
    return { start, end };
  }

  private toDateOnly(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private isSameDay(first: Date, second: Date): boolean {
    return (
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate()
    );
  }
}
