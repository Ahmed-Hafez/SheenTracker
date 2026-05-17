import { Component, inject } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from '../../core/services/sidebar.service';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  action?: () => void;
}

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
  imports: [RippleModule, RouterLink, RouterLinkActive],
})
export class SideBarComponent {
  private readonly sidebarService = inject(SidebarService);
  readonly isCollapsed = this.sidebarService.isCollapsed;
  readonly isMobile = this.sidebarService.isMobile;

  menuItems: MenuItem[] = [
    { icon: 'pi pi-objects-column', label: 'Dashboard', route: '/dashboard' },
    { icon: 'fa-solid fa-users', label: 'Users', route: '/users' },
    { icon: 'pi pi-chart-line', label: 'Reports', route: '/reports' },
  ];
  bottomMenuItems: MenuItem[] = [
    { icon: 'fa-solid fa-gear', label: 'Settings', route: '/settings' },
  ];
  onLinkClick(action?: () => void): void {
    if (this.isMobile()) {
      this.sidebarService.closeSidebarMobile();
    }
    if (action) {
      action();
    }
  }

  closeSidebarMobile(): void {
    this.sidebarService.closeSidebarMobile();
  }
}
