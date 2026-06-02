import { Component, signal, input, inject, OnInit, DestroyRef } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { SidebarService } from '../../../core/services/sidebar.service';

export interface MenuItem {
  label: string;
  icon?: string;
  routerLink?: string;
  items?: MenuItem[];
  action?: () => void;
}

@Component({
  selector: 'app-menu-item',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss',
})
export class MenuItemComponent implements OnInit {
  router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sidebarService = inject(SidebarService);
  readonly isMobile = this.sidebarService.isMobile;

  isSubmenuOpen = signal(false);
  private currentUrl = signal(this.router.url);

  menuItem = input.required<MenuItem>();
  isSidebarCollapsed = input.required<boolean>();

  toggleSubmenu(): void {
    this.isSubmenuOpen.update((open) => !open);
    
    if (this.isSidebarCollapsed()) {
      if (this.sidebarService.isTablet()) {
        this.sidebarService.toggleMobileOverlay();
      }
      this.sidebarService.expand();
    }

  }

  isChildRouteActive(): boolean {
    const items = this.menuItem().items;
    if (!items || items.length === 0) return false;
    const url = this.currentUrl();
    return items.some((child) => child.routerLink && url.startsWith(child.routerLink));
  }

  ngOnInit(): void {
    if (this.isChildRouteActive()) {
      this.isSubmenuOpen.set(true);
    }

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => {
        this.currentUrl.set(e.urlAfterRedirects);
      });
  }

  onLinkClick(action?: () => void): void {
    if (this.isMobile()) {
      this.sidebarService.closeSidebarMobile();
    }

    if (action) {
      action();
    }
  }
}
