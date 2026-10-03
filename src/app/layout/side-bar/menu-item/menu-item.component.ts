import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { SidebarService } from '../../../core/services/sidebar.service';

export interface MenuItem {
  label: string;
  icon?: string;
  routerLink?: string;
  /** Roles allowed to see this entry. Parents without roles show when any child is visible. */
  roles?: readonly string[];
  items?: MenuItem[];
}

@Component({
  selector: 'app-menu-item',
  imports: [RouterLink, RouterLinkActive, RippleModule, TooltipModule],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuItemComponent {
  private readonly router = inject(Router);
  private readonly sidebarService = inject(SidebarService);

  readonly menuItem = input.required<MenuItem>();
  readonly isSidebarCollapsed = input.required<boolean>();

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly isChildRouteActive = computed(() => {
    const url = this.currentUrl();
    return (this.menuItem().items ?? []).some(
      (child) => child.routerLink && url.startsWith(child.routerLink),
    );
  });

  /** Opens automatically when a child page is active; the user can still toggle it. */
  readonly isSubmenuOpen = linkedSignal(() => this.isChildRouteActive());

  readonly submenuId = computed(
    () => `submenu-${this.menuItem().label.toLowerCase().replace(/\W+/g, '-')}`,
  );

  toggleSubmenu(): void {
    if (this.isSidebarCollapsed()) {
      // A collapsed rail has no room for children: expand it and show them.
      this.sidebarService.toggleSidebar();
      this.isSubmenuOpen.set(true);
      return;
    }
    this.isSubmenuOpen.update((open) => !open);
  }

  onLinkClick(): void {
    this.sidebarService.closeSidebarMobile();
  }
}
