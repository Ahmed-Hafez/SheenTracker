import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';

export interface SettingNavItem extends MenuItem {
  label: string;
  description: string;
  icon: string;
  route?: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-settings',
  imports: [MenuModule, RippleModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  settingsItems: SettingNavItem[] = [
    {
      label: 'General',
      description: 'Coming soon',
      icon: 'pi pi-cog',
      route: '/settings/general',
      disabled: false,
    },
    {
      label: 'Users & Permissions',
      description: 'Accounts and access',
      icon: 'pi pi-users',
      route: '/settings/users-permisions',
      disabled: false,
    },
    {
      label: 'Integrations',
      description: 'Coming soon',
      icon: 'pi pi-link',
      route: 'integrations',
      disabled: true,
    },
  ];
}
