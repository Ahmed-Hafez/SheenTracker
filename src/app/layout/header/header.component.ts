import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { DateService } from '../../core/services/date.service';
import { QuarterYearService } from '../../core/services/quarter-year.service';
import { SelectModule } from 'primeng/select';
import { DateHelpers, DateRange } from '../../core/utils/date-helpers';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [DatePickerModule, FormsModule, SelectModule],
})
export class HeaderComponent implements OnInit {
  private readonly dateService = inject(DateService);
  private readonly quarterDateService = inject(QuarterYearService);

  readonly sidebarOpen = input(false);
  readonly isCollapsed = input(false);
  readonly title = input('');
  readonly subtitle = input('');
  readonly isQplanRoute = input(false);
  readonly toggleSidebar = output<void>();
  readonly toggleCollapse = output<void>();
  readonly refresh = output<void>();

  readonly rangeDates = signal<Date[] | null>(null);

  readonly availableQuarters = this.quarterDateService.getAvailableQuarters();
  selectedQuarter = signal(this.quarterDateService.getCurrentQuarter().quarter);

  minDate: Date | undefined;

  maxDate: Date | undefined;

  ngOnInit(): void {
    let today = new Date();
    let month = today.getMonth();
    let prevQuarter = month - 3;

    this.minDate = new Date();
    this.maxDate = new Date();

    this.minDate.setMonth(prevQuarter);
    this.maxDate.setDate(today.getDate());

    const existingRange = this.dateService.selectedDateRange();

    if (existingRange) {
      this.rangeDates.set([existingRange.start, existingRange.end]);
      return;
    }

    const defaultRange = [this.getDateNDaysAgo(30), new Date()];
    this.rangeDates.set(defaultRange);
    this.dateService.setDateRange(defaultRange[0], defaultRange[1]);
  }

  onQuarterChange(quarter: string): void {
    console.log('Selected Quarter:', quarter);
    //TODO: Implement the logic to handle quarter change and update the date range accordingly
  }

  isQuarterSelected(quarter: string): boolean {
    return this.selectedQuarter() == quarter;
  }

  formatDate(dateRange: DateRange): string {
    return DateHelpers.formatRange(dateRange);
  }

  onRangeChange(rangeDates: Date[] | null): void {
    this.rangeDates.set(rangeDates);
    this.dateService.setDateRangeFromArray(rangeDates);
  }

  onRefreshClick(): void {
    this.refresh.emit();
  }

  getDateNDaysAgo(n: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - n);
    return date;
  }
}
