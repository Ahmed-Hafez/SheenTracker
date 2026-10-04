import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SidebarService } from '../../core/services/sidebar.service';
import { AuthService } from '../../core/http/backend_service/auth.service';
import { MenuItem, MenuItemComponent } from './menu-item/menu-item.component';
import { PAGE_ROLES, hasRole } from '../../core/utils/roles.util';

interface UserData {
  roles: string[];
  email: string;
  fullName: string;
}

/** The full navigation tree. Visibility comes from the same role lists the route guards use. */
const MENU: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: 'pi pi-objects-column',
    routerLink: '/dashboard',
    roles: PAGE_ROLES.dashboard,
  },
  {
    label: 'Users',
    icon: 'pi pi-users',
    items: [
      { label: 'Azure Users', routerLink: '/users/azure', roles: PAGE_ROLES.azureUsers },
      { label: 'System Users', routerLink: '/users/system', roles: PAGE_ROLES.systemUsers },
    ],
  },
  { label: 'Squads', icon: 'pi pi-sitemap', routerLink: '/squads', roles: PAGE_ROLES.squads },
  {
    label: 'Reports',
    icon: 'pi pi-chart-bar',
    items: [
      {
        label: 'Project Utilization',
        routerLink: '/reports/project-utilization',
        roles: PAGE_ROLES.projectUtilization,
      },
    ],
  },
  {
    label: 'Quarter Plans',
    icon: 'pi pi-calendar',
    routerLink: '/quarter-plans',
    roles: PAGE_ROLES.quarterPlans,
  },
  { label: 'Settings', icon: 'pi pi-cog', routerLink: '/settings', roles: PAGE_ROLES.settings },
];

function visibleItems(items: MenuItem[], roles: string[]): MenuItem[] {
  return items.flatMap((item) => {
    if (item.items) {
      const children = visibleItems(item.items, roles);
      return children.length > 0 ? [{ ...item, items: children }] : [];
    }
    return !item.roles || hasRole(roles, ...item.roles) ? [item] : [];
  });
}

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
  imports: [RouterLink, NgOptimizedImage, MenuItemComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SideBarComponent {
  private readonly sidebarService = inject(SidebarService);
  private readonly authService = inject(AuthService);

  readonly isCollapsed = this.sidebarService.isCollapsed;
  readonly isOverlayOpen = this.sidebarService.isOverlayOpen;

  readonly userData: UserData | null = this.authService.getUserData();
  readonly homePage = this.authService.getMainPageBasedOnUserRole();

  readonly menuItems = visibleItems(MENU, this.userData?.roles ?? []);

  /** "Omar Sherif" -> "OS"; a single name gives its first letter. */
  readonly initials = (this.userData?.fullName ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

  closeNavigation(): void {
    this.sidebarService.closeSidebarMobile();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
