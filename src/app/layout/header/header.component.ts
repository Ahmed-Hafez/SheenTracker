import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { DateService } from '../../core/services/date.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [DatePickerModule, FormsModule],
})
export class HeaderComponent implements OnInit {
  private readonly dateService = inject(DateService);

  readonly sidebarOpen = input(false);
  readonly isCollapsed = input(false);
  readonly title = input('');
  readonly subtitle = input('');
  readonly toggleSidebar = output<void>();
  readonly toggleCollapse = output<void>();

  readonly rangeDates = signal<Date[] | null>(null);

  ngOnInit(): void {
    const existingRange = this.dateService.selectedDateRange();

    if (existingRange) {
      this.rangeDates.set([existingRange.start, existingRange.end]);
      return;
    }

    const defaultRange = [this.getDateNDaysAgo(30), new Date()];
    this.rangeDates.set(defaultRange);
    this.dateService.setDateRange(defaultRange[0], defaultRange[1]);
  }

  datePickerPT = {
    pcInputText: {
      root: ' p-inputtext p-component',
    },
  };

  onRangeChange(rangeDates: Date[] | null): void {
    this.rangeDates.set(rangeDates);
    this.dateService.setDateRangeFromArray(rangeDates);
  }

  getDateNDaysAgo(n: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - n);
    return date;
  }
}
