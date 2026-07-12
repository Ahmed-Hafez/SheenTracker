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

  userData = signal<UserData | null>(null);

  isSubmenuOpen = signal(false);

  mainMenuItems = signal<MenuItem[]>([]);

  ngOnInit(): void {
    this.getUserData(); // Fetch user data on component initialization
  }

  constructor() {
    effect(() => {
      this.mainMenuItems.set([
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
      ]);
    });
  }

  getUserData() {
    const userData = this.authService.getUserData();
    this.userData.set(userData);
  }

  onLogout(): void {
    this.authService.logout();
  }
}
