import { NgOptimizedImage } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { RippleModule } from 'primeng/ripple';

import { PanelMenuModule } from 'primeng/panelmenu';

import { SidebarService } from '../../core/services/sidebar.service';
import { AuthService } from '../../core/http/backend_service/auth.service';
import { MenuItem, MenuItemComponent } from './menu-item/menu-item.component';

interface UserData {
  roles: string[];
  email: string;
  fullName: string;
}

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
  imports: [RippleModule, RouterLink, PanelMenuModule, MenuItemComponent],
})
export class SideBarComponent implements OnInit {
  private readonly sidebarService = inject(SidebarService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly isCollapsed = this.sidebarService.isCollapsed;

  private readonly coordinationHiddenLabels = new Set([]);
  private readonly hrHiddenLabels = new Set(['Squads', 'System Users']);

  userData = signal<UserData | null>(null);

  isSubmenuOpen = signal(false);

  mainMenuItems = signal<MenuItem[]>([]);

  ngOnInit(): void {
    this.getUserData(); // Fetch user data on component initialization
  }

  constructor() {
    effect(() => {
      this.mainMenuItems.set(this.getMenuItemsBasedOnRoles(this.userData()?.roles || null));
    });
  }

  allMenuItems = [
    {
      icon: 'pi pi-objects-column',
      label: 'Dashboard',
      routerLink: '/dashboard',
    },
    {
      label: 'Users',
      icon: 'pi pi-users',
      action: () => {
        this.router.navigate(['/users/azure']);
      },
      items: this.isCollapsed()
        ? []
        : [
            {
              label: 'Azure Users',
              routerLink: '/users/azure',
            },
            {
              label: 'System Users',
              routerLink: '/users/system',
            },
          ],
    },
    {
      label: 'Squads',
      icon: 'pi pi-sitemap',
      routerLink: '/squads',
    },
    {
      label: 'Reports',
      icon: 'pi pi-chart-bar',
      items: this.isCollapsed()
        ? []
        : [
            {
              label: 'Projects Utilization',
              routerLink: '/reports/project-utilization',
            },
          ],
    },
  ];

  getMenuItemsBasedOnRoles(roles: string[] | null): MenuItem[] {
    if (roles?.includes('HR') && roles?.includes('Coordination')) {
      return this.allMenuItems;
    } else if (roles?.includes('HR')) {
      return this.filterMenuItems(this.hrHiddenLabels);
    } else if (roles?.includes('Coordination')) {
      return this.filterMenuItems(this.coordinationHiddenLabels);
    }

    return [];
  }

  private filterMenuItems(hiddenLabels: Set<string>): MenuItem[] {
    return this.allMenuItems
      .filter((item) => !hiddenLabels.has(item.label))
      .map((item) => ({
        ...item,
        items: item.items?.filter((child) => !hiddenLabels.has(child.label)),
      }))
      .filter((item) => item.items === undefined || item.items.length > 0);
  }

  getUserData() {
    const userData = this.authService.getUserData();
    this.userData.set(userData);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
