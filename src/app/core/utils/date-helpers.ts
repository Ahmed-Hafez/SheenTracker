export interface DateRange {
  start: Date;
  end: Date;
}
export class DateHelpers {
  static formatRange(range: DateRange): string {
    return `${this.formatShortDate(range.start)} - ${this.formatShortDate(range.end)}`;
  }

  static formatShortDate(date: Date): string {
    const month = date.toLocaleString('en-US', { month: 'short' });
    return `${date.getDate()} ${month} ${date.getFullYear()}`;
  }

  static toDateOnly(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
