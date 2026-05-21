import { Injectable, signal, computed, inject, PLATFORM_ID, DestroyRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { fromEvent, startWith, map, distinctUntilChanged, filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  private readonly collapsedWidth = 80;
  private readonly desktopExpandedWidth = 256;
  private readonly overlayExpandedWidth = 288;

  isCollapsed = signal(false);
  isMobileOverlayOpen = signal(false);

  private readonly laptopBreakpoint = 1024;
  private readonly phoneBreakpoint = 640;

  isTablet = signal(false);
  isPhone = signal(false);
  isSupplierRoute = signal(false);

  isMobile = computed(() => this.isTablet() || this.isPhone());

  sidebarWidthPx = computed(() => {
    if (this.isPhone()) return this.overlayExpandedWidth;
    if (this.isTablet())
      return this.isCollapsed() ? this.collapsedWidth : this.overlayExpandedWidth;
    return this.isCollapsed() ? this.collapsedWidth : this.desktopExpandedWidth;
  });

  mainOffsetPx = computed(() => {
    if (this.isPhone()) return 0;
    if (this.isTablet()) return this.collapsedWidth; // keep offset at 80 so expanded sidebar overlaps with an overlay
    return this.isCollapsed() ? this.collapsedWidth : this.desktopExpandedWidth;
  });

  init(destroyRef: DestroyRef) {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        map((event) => event.urlAfterRedirects),
        startWith(this.router.url),
        distinctUntilChanged(),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe((url) => {
        this.isSupplierRoute.set(url.includes('/suppliers'));
      });

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    fromEvent(window, 'resize')
      .pipe(
        startWith(null),
        map(() => window.innerWidth),
        distinctUntilChanged(),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe((width) => {
        const isTabletView = width < this.laptopBreakpoint && width >= this.phoneBreakpoint;
        const isPhoneView = width < this.phoneBreakpoint;

        this.isTablet.set(isTabletView);
        this.isPhone.set(isPhoneView);

        if (isTabletView) {
          this.collapse();
          this.closeMobileOverlay();
        } else if (isPhoneView) {
          this.expand();
          this.closeMobileOverlay();
        } else {
          this.expand();
          this.closeMobileOverlay();
        }
      });
  }

  toggleSidebar() {
    if (this.isPhone()) {
      this.isMobileOverlayOpen.update((v) => !v);
    } else if (this.isTablet()) {
      this.isCollapsed.update((v) => !v);
      this.isMobileOverlayOpen.set(!this.isCollapsed());
    } else {
      this.isCollapsed.update((v) => !v);
    }
  }

  closeSidebarMobile() {
    if (this.isPhone()) {
      this.isMobileOverlayOpen.set(false);
    } else if (this.isTablet()) {
      this.isMobileOverlayOpen.set(false);
      this.isCollapsed.set(true);
    }
  }

  toggleCollapse() {
    this.toggleSidebar();
  }

  collapse() {
    this.isCollapsed.set(true);
  }

  expand() {
    this.isCollapsed.set(false);
  }

  toggleMobileOverlay() {
    this.isMobileOverlayOpen.update((open) => !open);
  }

  closeMobileOverlay() {
    this.isMobileOverlayOpen.set(false);
  }
}
