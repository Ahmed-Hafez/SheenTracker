import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/http/backend_service/auth.service';
import { hasRole, PAGE_ROLES } from '../../../core/utils/roles.util';

interface SettingsSection {
  label: string;
  route: string;
  /** Same roles as the child route's guard, so a tab never leads to a refused page. */
  roles: readonly string[];
}

/** Settings is one page with a tab row under the topbar title; each tab is its own route. */
@Component({
  selector: 'app-settings',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsComponent {
  private readonly authService = inject(AuthService);

  private readonly sections: SettingsSection[] = [
    { label: 'General', route: '/settings/general', roles: PAGE_ROLES.settings },
    {
      label: 'Users & Permissions',
      route: '/settings/users-permissions',
      roles: PAGE_ROLES.settings,
    },
    { label: 'App Settings', route: '/settings/app-settings', roles: PAGE_ROLES.appSettings },
  ];

  readonly visibleSections = computed(() => {
    const roles = this.authService.getUserData()?.roles ?? [];
    return this.sections.filter((section) => hasRole(roles, ...section.roles));
  });
}
