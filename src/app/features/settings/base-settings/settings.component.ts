import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface SettingsSection {
  label: string;
  route: string;
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
  readonly sections: SettingsSection[] = [
    { label: 'General', route: '/settings/general' },
    { label: 'Users & Permissions', route: '/settings/users-permissions' },
  ];
}
