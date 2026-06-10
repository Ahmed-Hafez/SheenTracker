import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { distinctUntilChanged, filter, map, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { SidebarService } from '../core/services/sidebar.service';
import { DateRange, DateService } from '../core/services/date.service';
import { RefreshService } from '../core/services/refresh.service';

@Component({
  selector: 'app-layout',
  imports: [HeaderComponent, RouterOutlet, SideBarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly sidebarService = inject(SidebarService);
  private readonly dateService = inject(DateService);
  private readonly refreshService = inject(RefreshService);
  private readonly router = inject(Router);

  readonly hideSidebar = this.sidebarService.isSupplierRoute;

  readonly sidebarCollapsed = this.sidebarService.isCollapsed;
  readonly mobileOverlayOpen = this.sidebarService.isMobileOverlayOpen;

  readonly isTablet = this.sidebarService.isTablet;
  readonly isPhone = this.sidebarService.isPhone;
  readonly isMobile = this.sidebarService.isMobile;

  readonly sidebarWidthPx = this.sidebarService.sidebarWidthPx;
  readonly mainOffsetPx = this.sidebarService.mainOffsetPx;

  readonly pageTitle = signal('Dashboard');
  readonly pageSubtitle = computed(() => {
    const range = this.dateService.selectedDateRange();
    const suffix = 'Azure DevOps activity';

    if (!range) {
      return suffix;
    }

    if (this.dateService.isDefaultRangeSelected(range)) {
      return `Last 30 days · ${suffix}`;
    }

    return `${this.formatRange(range)} · ${suffix}`;
  });

  ngOnInit(): void {
    this.sidebarService.init(this.destroyRef);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map((event) => event.urlAfterRedirects),
        startWith(this.router.url),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((url) => {
        const title = this.getTitleFromUrl(url);
        this.pageTitle.set(title);
      });
  }

  private getTitleFromUrl(url: string): string {
    if (url.startsWith('/users/azure')) return 'Azure Users';
    if (url.startsWith('/users/system')) return 'System Users';
    if (url.startsWith('/users/')) return 'User Details';
    if (url.startsWith('/squads')) return 'Squads';
    if (url.startsWith('/squads/')) return 'Squad Details';
    if (url.startsWith('/reports')) return 'Reports';
    if (url.startsWith('/settings')) return 'Settings';
    if (url === '/' || url.startsWith('/dashboard')) return 'Dashboard';

    return 'Overview';
  }

  private formatRange(range: DateRange): string {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    return `${formatter.format(range.start)} - ${formatter.format(range.end)}`;
  }

  toggleSidebarMobile(): void {
    this.sidebarService.toggleSidebar();
  }

  onToggleCollapse(): void {
    this.sidebarService.toggleSidebar();
  }

  closeSidebarMobile(): void {
    this.sidebarService.closeSidebarMobile();
  }

  onRefresh(): void {
    this.refreshService.trigger();
  }
}
