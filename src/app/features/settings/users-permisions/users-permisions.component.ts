import {
  Component,
  DestroyRef,
  effect,
  inject,
  Injector,
  OnInit,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { of } from 'rxjs';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';

import { AuthUserFormDialogComponent } from './auth-user-form-dialog/auth-user-form-dialog.component';
import { DeletePopupComponent } from '../../../shared/delete-popup/delete-popup.component';
import { PortalUsersService } from '../../../core/http/backend_service/portal-users.service';
import { RefreshService } from '../../../core/services/refresh.service';
import { PortalUserResponse } from '../../../core/models/reponse/portal-user.response.model';

@Component({
  selector: 'app-users-permisions',
  imports: [
    TableModule,
    TagModule,
    ReactiveFormsModule,
    AuthUserFormDialogComponent,
    DeletePopupComponent,
  ],
  templateUrl: './users-permisions.component.html',
  styleUrl: './users-permisions.component.scss',
})
export class UsersPermisionsComponent implements OnInit {
  private readonly portalUserService = inject(PortalUsersService);
  private readonly refreshService = inject(RefreshService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  users = this.portalUserService.users$;
  isLoading = signal(false);

  userDialogVisible = signal(false);
  deleteRequestVisible = signal(false);
  selectedUser = signal<PortalUserResponse | null>(null);
  isEditMode = signal(false);

  usersFilterForm!: FormGroup;

  ngOnInit() {
    this.usersFilterForm = this.fb.group({
      searchTerm: [''],
    });

    this.usersFilterForm
      .get('searchTerm')
      ?.valueChanges.pipe(
        startWith(''),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term) => {
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
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users.',
        });
      },
    });
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
          summary: 'Success',
          detail: `${user.firstName} ${user.lastName} has been activated.`,
        });
        this.refreshService.trigger();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to activate user.',
        });
      },
    });
  }

  deactivateUser(user: PortalUserResponse) {
    this.portalUserService.deactivatePortalUser(user.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: `${user.firstName} ${user.lastName} has been deactivated.`,
        });
        this.refreshService.trigger();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to deactivate user.',
        });
      },
    });
  }

  onDialogVisibleChange(visible: boolean) {
    this.userDialogVisible.set(visible);
    if (!visible) {
      this.selectedUser.set(null);
      this.isEditMode.set(false);
    }
  }

  getUserDisplayName(user: PortalUserResponse): string {
    return `${user.firstName} ${user.lastName}`;
  }
}
