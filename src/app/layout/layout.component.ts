import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  afterRenderEffect,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { HeaderComponent } from './header/header.component';
import { SideBarComponent } from './side-bar/side-bar.component';
import { SidebarService } from '../core/services/sidebar.service';
import { DateService } from '../core/services/date.service';
import { QuarterYearService } from '../core/services/quarter-year.service';
import { DateHelpers } from '../core/utils/date-helpers';
import { ShellRouteData } from './shell-route-data';

@Component({
  selector: 'app-layout',
  imports: [HeaderComponent, RouterOutlet, SideBarComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closeOverlay()',
  },
})
export class LayoutComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly sidebarService = inject(SidebarService);
  private readonly dateService = inject(DateService);
  private readonly quarterDateService = inject(QuarterYearService);
  private readonly router = inject(Router);

  private readonly aside = viewChild<ElementRef<HTMLElement>>('aside');

  readonly hideSidebar = this.sidebarService.isSupplierRoute;
  readonly isPhone = this.sidebarService.isPhone;
  readonly isOverlayOpen = this.sidebarService.isOverlayOpen;
  readonly sidebarWidthPx = this.sidebarService.sidebarWidthPx;
  readonly mainOffsetPx = this.sidebarService.mainOffsetPx;

  /** The closed phone drawer is off-screen, so it must also leave the tab order. */
  readonly sidebarHidden = computed(
    () => this.isPhone() && !this.sidebarService.isMobileOverlayOpen(),
  );

  private readonly routeData = signal<ShellRouteData>({});

  readonly pageTitle = computed(() => this.routeData().header ?? 'SheenTrack 360°');
  readonly dateScope = computed(() => this.routeData().dateScope ?? 'none');
  readonly showRefresh = computed(() => this.routeData().refresh ?? false);

  readonly pageSubtitle = computed(() => {
    switch (this.dateScope()) {
      case 'range': {
        const range = this.dateService.selectedDateRange();
        const suffix = 'Azure DevOps activity';
        return range ? `${DateHelpers.formatRange(range)} · ${suffix}` : suffix;
      }
      case 'quarter': {
        const quarter = this.quarterDateService.getCurrentQuarter();
        return `${quarter.quarter} · ${DateHelpers.formatRange(quarter.dateRange)}`;
      }
      default:
        return '';
    }
  });

  constructor() {
    // Move focus into the drawer when it opens and back to the toggle when it closes.
    let wasOpen = false;
    afterRenderEffect(() => {
      const open = this.isOverlayOpen();
      if (open === wasOpen) return;
      wasOpen = open;

      if (open) {
        this.aside()?.nativeElement.querySelector<HTMLElement>('a[href], button')?.focus();
      } else {
        document.getElementById('sidebar-toggle')?.focus();
      }
    });
  }

  ngOnInit(): void {
    this.sidebarService.init(this.destroyRef);

    this.routeData.set(this.collectRouteData(this.router.routerState.snapshot.root));
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.routeData.set(this.collectRouteData(this.router.routerState.snapshot.root));
      });
  }

  /** Merges `data` from the root down to the active leaf, so children override parents. */
  private collectRouteData(route: ActivatedRouteSnapshot): ShellRouteData {
    let data: ShellRouteData = {};
    for (
      let current: ActivatedRouteSnapshot | null = route;
      current;
      current = current.firstChild
    ) {
      data = { ...data, ...(current.data as ShellRouteData) };
    }
    return data;
  }

  closeOverlay(): void {
    if (this.isOverlayOpen()) {
      this.sidebarService.closeSidebarMobile();
    }
  }
}
