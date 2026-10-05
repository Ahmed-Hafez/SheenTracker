import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { DateService } from '../../core/services/date.service';
import { PlanQuarterService } from '../../core/services/plan-quarter.service';
import { RefreshService } from '../../core/services/refresh.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { formatQuarterDates, formatQuarterLabel } from '../../core/utils/plan-quarter';
import { DateScope } from '../shell-route-data';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [DatePickerModule, FormsModule, SelectModule, DatePipe, NgOptimizedImage],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .page-title {
      font-size: 15px;
      font-weight: 600;
      line-height: 1.4;
      letter-spacing: 0;
      color: var(--charcoal-900);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .page-subtitle {
      font-size: 12px;
      line-height: 1.5;
      color: var(--charcoal-600);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .refreshed-at {
      font-size: 12px;
      color: var(--charcoal-600);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    @media (max-width: 639px) {
      .page-subtitle {
        display: none;
      }
    }
  `,
})
export class HeaderComponent implements OnInit {
  private readonly dateService = inject(DateService);
  private readonly planQuarterService = inject(PlanQuarterService);
  private readonly refreshService = inject(RefreshService);
  private readonly sidebarService = inject(SidebarService);

  readonly title = input('');
  readonly subtitle = input('');
  readonly dateScope = input<DateScope>('none');
  readonly showRefresh = input(false);

  readonly isPhone = this.sidebarService.isPhone;
  readonly navExpanded = this.sidebarService.navExpanded;
  readonly toggleLabel = computed(() => {
    if (this.sidebarService.isPhone()) {
      return this.navExpanded() ? 'Close navigation' : 'Open navigation';
    }
    return this.navExpanded() ? 'Collapse sidebar' : 'Expand sidebar';
  });

  readonly lastRefreshedAt = this.refreshService.lastRefreshedAt;
  readonly rangeDates = signal<Date[] | null>(null);

  /** Quarters from Azure DevOps, newest first so the current one sits near the top. */
  readonly quarterOptions = computed(() =>
    this.planQuarterService
      .quarters()
      .map((q) => ({
        name: q.name,
        label: formatQuarterLabel(q.name),
        dates: formatQuarterDates(q),
      }))
      .reverse(),
  );
  readonly selectedQuarter = computed(() => this.planQuarterService.selected()?.name ?? null);

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

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  onQuarterChange(name: string | null): void {
    if (name && name !== this.selectedQuarter()) {
      this.planQuarterService.select(name);
    }
  }

  isQuarterSelected(name: string): boolean {
    return this.selectedQuarter() === name;
  }

  onRangeChange(rangeDates: Date[] | null): void {
    this.rangeDates.set(rangeDates);
    this.dateService.setDateRangeFromArray(rangeDates);
  }

  onRefreshClick(): void {
    this.refreshService.trigger();
  }

  getDateNDaysAgo(n: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - n);
    return date;
  }
}
