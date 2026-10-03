import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  Injector,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { of } from 'rxjs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { Menu, MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { MenuItem, MessageService } from 'primeng/api';

import { AuthUserFormDialogComponent } from './auth-user-form-dialog/auth-user-form-dialog.component';
import { DeletePopupComponent } from '../../../shared/delete-popup/delete-popup.component';
import { PortalUsersService } from '../../../core/http/backend_service/portal-users.service';
import { RefreshService } from '../../../core/services/refresh.service';
import { PortalUserResponse } from '../../../core/models/reponse/portal-user.response.model';
import { AuthService } from '../../../core/http/backend_service/auth.service';
import { isSuperAdmin } from '../../../core/utils/roles.util';

@Component({
  selector: 'app-users-permissions',
  imports: [
    TableModule,
    TagModule,
    MenuModule,
    DialogModule,
    ReactiveFormsModule,
    AuthUserFormDialogComponent,
    DeletePopupComponent,
  ],
  templateUrl: './users-permissions.component.html',
  styleUrl: './users-permissions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPermissionsComponent implements OnInit {
  private readonly portalUserService = inject(PortalUsersService);
  private readonly refreshService = inject(RefreshService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly authService = inject(AuthService);

  private readonly rowMenu = viewChild.required<Menu>('rowMenu');

  /** Only a Super Admin may edit, delete, activate or deactivate another Super Admin (backend returns 403 otherwise). */
  private readonly currentUserIsSuperAdmin = isSuperAdmin(this.authService.getUserData()?.roles);

  users = this.portalUserService.users$;
  isLoading = signal(false);
  loadFailed = signal(false);
  searchTerm = signal('');

  userDialogVisible = signal(false);
  deleteRequestVisible = signal(false);
  selectedUser = signal<PortalUserResponse | null>(null);
  isEditMode = signal(false);

  rowMenuItems = signal<MenuItem[]>([]);
  deactivateTarget = signal<PortalUserResponse | null>(null);
  statusActionLoading = signal(false);

  usersFilterForm!: FormGroup;

  ngOnInit() {
    this.usersFilterForm = this.fb.group({
      searchTerm: [''],
    });

    this.usersFilterForm
      .get('searchTerm')
      ?.valueChanges.pipe(startWith(''), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => {
        this.searchTerm.set((term ?? '').trim());
        this.portalUserService.filterUsers(term ?? '');
      });

    effect(
      () => {
        this.refreshService.refreshTick();
        this.loadUsers();
      },
      { injector: this.injector },
    );
  }

  loadUsers() {
    this.isLoading.set(true);
    this.loadFailed.set(false);
    // The error interceptor already reports the failure; the table shows a retry state.
    this.portalUserService.fetchAllUsers().subscribe({
      next: () => {
        this.isLoading.set(false);
        const term = this.usersFilterForm?.get('searchTerm')?.value ?? '';
        if (term) {
          this.portalUserService.filterUsers(term);
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.loadFailed.set(true);
      },
    });
  }

  clearSearch() {
    this.usersFilterForm.get('searchTerm')?.setValue('');
  }

  showAddPopup() {
    this.selectedUser.set(null);
    this.isEditMode.set(false);
    this.userDialogVisible.set(true);
  }

  showEditPopup(user: PortalUserResponse) {
    this.selectedUser.set(user);
    this.isEditMode.set(true);
    this.userDialogVisible.set(true);
  }

  openRowMenu(event: Event, user: PortalUserResponse) {
    this.rowMenuItems.set([
      user.isActive
        ? {
            label: 'Deactivate',
            icon: 'pi pi-ban',
            command: () => this.deactivateTarget.set(user),
          }
        : {
            label: 'Activate',
            icon: 'pi pi-check',
            command: () => this.activateUser(user),
          },
      { separator: true },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        styleClass: 'row-menu-danger',
        command: () => this.showDeletePopup(user),
      },
    ]);
    this.rowMenu().toggle(event);
  }

  showDeletePopup(user: PortalUserResponse) {
    this.selectedUser.set(user);
    this.deleteRequestVisible.set(true);
  }

  closeDeletePopup(visible: boolean) {
    this.deleteRequestVisible.set(visible);
    if (!visible) {
      this.refreshService.trigger();
    }
  }

  deleteUser(userId: number) {
    if (!userId) {
      return of(null);
    }
    return this.portalUserService.deletePortalUser(userId);
  }

  activateUser(user: PortalUserResponse) {
    this.portalUserService.activatePortalUser(user.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'User activated',
          detail: `${this.getUserDisplayName(user)} can sign in again.`,
        });
        this.refreshService.trigger();
      },
    });
  }

  confirmDeactivate() {
    const user = this.deactivateTarget();
    if (!user) {
      return;
    }
    this.statusActionLoading.set(true);
    this.portalUserService.deactivatePortalUser(user.id).subscribe({
      next: () => {
        this.statusActionLoading.set(false);
        this.deactivateTarget.set(null);
        this.messageService.add({
          severity: 'success',
          summary: 'User deactivated',
          detail: `${this.getUserDisplayName(user)} can no longer sign in.`,
        });
        this.refreshService.trigger();
      },
      error: () => this.statusActionLoading.set(false),
    });
  }

  cancelDeactivate() {
    this.deactivateTarget.set(null);
  }

  onDialogVisibleChange(visible: boolean) {
    this.userDialogVisible.set(visible);
    if (!visible) {
      this.selectedUser.set(null);
      this.isEditMode.set(false);
    }
  }

  canManageUser(user: PortalUserResponse): boolean {
    return this.currentUserIsSuperAdmin || !isSuperAdmin([user.role]);
  }

  getUserDisplayName(user: PortalUserResponse): string {
    return `${user.firstName} ${user.lastName}`;
  }
}
