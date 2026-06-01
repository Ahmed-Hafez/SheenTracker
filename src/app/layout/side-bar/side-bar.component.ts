import { NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { RippleModule } from 'primeng/ripple';

import {PanelMenuModule } from 'primeng/panelmenu';

import { SidebarService } from '../../core/services/sidebar.service';
import { MenuItem, MenuItemComponent } from "./menu-item/menu-item.component";

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
  imports: [RippleModule, RouterLink, RouterLinkActive, PanelMenuModule, MenuItemComponent],
})
export class SideBarComponent implements OnInit {
isUsersRoute(): boolean {
throw new Error('Method not implemented.');
}
  private readonly sidebarService = inject(SidebarService);
  private readonly router = inject(Router);
  readonly isCollapsed = this.sidebarService.isCollapsed;

  isSubmenuOpen = signal(false);

  mainMenuItems: MenuItem[] = [];

  bottomMenuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.initializeMenuItems();

  }

  initializeMenuItems(): void {
    this.mainMenuItems = [
      {
        icon: 'pi pi-objects-column',
        label: 'Dashboard',
        routerLink: '/dashboard',
      },
      {
        label: 'Users',
        icon: 'pi pi-users',
        action: () => { this.router.navigate(['/users/azure']); },
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
        icon: 'pi pi-chart-line',
        label: 'Reports',
        routerLink: '/reports',
      },
    ];
    this.bottomMenuItems = [
      { icon: 'fa-solid fa-gear', label: 'Settings', routerLink: '/settings' },
    ];
  }



  
}
