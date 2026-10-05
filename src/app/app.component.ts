import { Component, computed, effect, inject, untracked } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MetaDataService } from './core/http/backend_service/meta-data.service';
import { AuthService } from './core/http/backend_service/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { hasRole, holdsRole } from './core/utils/roles.util';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.component.html',
})
export class App {
  private readonly metaDataService = inject(MetaDataService);
  private readonly authService = inject(AuthService);
  messageService = inject(MessageService);

  /**
   * Toasts sit at the top right of the workspace, under the topbar so they never cover the page
   * title or the date and refresh controls. Signed-out pages have no topbar.
   */
  readonly toastTop = computed(() =>
    this.authService.isAuthenticated() ? 'calc(var(--topbar-height) + 12px)' : '16px',
  );

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.initialize();
      }
    });
  }
  initialize() {
    const roles = this.authService.getUserData()?.roles ?? [];
    const isCoordination = hasRole(roles, 'Coordination');
    const isBussiness = holdsRole(roles, 'Business') && roles.length === 1;
    const isProjectManger = holdsRole(roles, 'ProjectManager') && roles.length === 1;
    untracked(() => {
      if (!isBussiness && !isProjectManger) {
        this.getRoles();
        this.getMetaData();
        if (isCoordination) {
          this.getSquads();
        }
      }
    });
  }

  getMetaData() {
    this.metaDataService.isUsersLoading.set(true);
    console.log('is loading', this.metaDataService.isUsersLoading());
    this.metaDataService.getAzureUsersMetaData().subscribe({
      next: (users) => {
        this.metaDataService.isUsersLoading.set(false);
        console.log('Fetched', users, 'is loading', this.metaDataService.isUsersLoading());
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error fetching Azure users',
        });
        this.metaDataService.isUsersLoading.set(false);
      },
    });
  }

  getSquads() {
    this.metaDataService.isSquadsLoading.set(true);
    this.metaDataService.getSquads().subscribe({
      next: (squads) => {
        this.metaDataService.isSquadsLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error fetching squads',
        });
        this.metaDataService.isSquadsLoading.set(false);
      },
    });
  }

  getRoles() {
    this.metaDataService.isRolesLoading.set(true);
    this.metaDataService.getRoles().subscribe({
      next: (roles) => {
        this.metaDataService.isRolesLoading.set(false);
      },
      error: () => {
        this.metaDataService.isRolesLoading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error fetching roles',
        });
      },
    });
  }
}
