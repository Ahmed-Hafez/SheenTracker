import { Component, signal, input, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
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
  private readonly sidebarService = inject(SidebarService);
  readonly isMobile = this.sidebarService.isMobile;
  
  isSubmenuOpen = signal(false);

  menuItem = input.required<MenuItem>();
  isSidebarCollapsed = input.required<boolean>();

  toggleSubmenu(): void {
    this.isSubmenuOpen.update((open) => !open);
  }

  isUsersRoute(): boolean {
    return this.router.url.includes('/users');
  }

  ngOnInit(): void {
    if (this.isUsersRoute()) {
      this.isSubmenuOpen.set(true);
    }
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
