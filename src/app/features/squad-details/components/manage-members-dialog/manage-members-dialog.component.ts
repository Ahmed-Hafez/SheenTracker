import {
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MessageService } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { Listbox } from 'primeng/listbox';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ListBoxPassThrough } from 'primeng/types/listbox';

import { SquadsService } from '../../../../core/http/backend_service/squads.service';
import { SystemUsersService } from '../../../../core/http/backend_service/system-users.service';
import { SystemUser } from '../../../../core/models/reponse/system-users.response.model';
import { Squad } from '../../../../core/models/reponse/sqauds.response.model';

@Component({
  selector: 'app-manage-members-dialog',
  imports: [
    FormsModule,
    Dialog,
    Listbox,
    Button,
    ProgressSpinner,
    Avatar,
  ],
  templateUrl: './manage-members-dialog.component.html',
  styleUrl: './manage-members-dialog.component.scss',
})
export class ManageMembersDialogComponent {
  private readonly squadsService = inject(SquadsService);
  private readonly systemUsersService = inject(SystemUsersService);
  private readonly messageService = inject(MessageService);

  squadDetails = input.required<Squad>();
  currentMemberIds = input.required<number[]>();

  membersUpdated = output<string[]>();

  dialogVisible = signal(false);
  searchQuery = signal('');
  allUsers = signal<SystemUser[]>([]);
  originalMemberIds = signal<string[]>([]);
  selectedUserIds = signal<string[]>([]);
  isSaving = signal(false);
  isUsersLoading = signal(false);

  lockedUserIds = computed(() => {
    const ids: string[] = [];
    const po = this.squadDetails().productOwnerId;
    const sm = this.squadDetails().scrumMasterId;
    if (po) ids.push(String(po));
    if (sm) ids.push(String(sm));
    return ids;
  });

  filteredUsers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const users = this.allUsers();
    if (!query) return users;
    return users.filter((user) => user.fullName.toLowerCase().includes(query));
  });

  selectedUsers = computed(() => {
    const ids = new Set(this.selectedUserIds());
    return this.allUsers().filter((u) => ids.has(String(u.id)));
  });

  selectedCount = computed(() => {
    const locked = new Set(this.lockedUserIds());
    return this.selectedUserIds().filter((id) => !locked.has(id)).length;
  });

  hasChanges = computed(() => {
    const locked = new Set(this.lockedUserIds());
    const original = this.originalMemberIds()
      .filter((id) => !locked.has(id))
      .sort();
    const current = this.selectedUserIds()
      .filter((id) => !locked.has(id))
      .sort();

    if (original.length !== current.length) return true;
    return original.some((id, index) => id !== current[index]);
  });

  listboxPt: ListBoxPassThrough = {
    root: {
      class: 'border-0 shadow-none bg-transparent w-full p-0',
    },
    listContainer: {
      class: 'max-h-[320px] overflow-y-auto border-0',
      style: { maxHeight: '320px' },
    },
    list: {
      class: 'p-0 m-0 list-none',
    },
    option: {
      class:
        'border-0 rounded-md px-2 py-1 transition-colors cursor-pointer hover:bg-[#F5F4F0] [&.p-disabled]:opacity-50 [&.p-disabled]:cursor-not-allowed [&.p-disabled]:hover:bg-transparent',
    },
    emptyMessage: {
      class: 'text-sm text-[var(--charcoal-600)] py-4 text-center',
    },
  };

  open(): void {
    this.searchQuery.set('');
    this.initializeSelection();
    this.loadUsers();
    this.dialogVisible.set(true);
  }

  onVisibleChange(visible: boolean): void {
    this.dialogVisible.set(visible);
    if (!visible) {
      this.searchQuery.set('');
      this.isSaving.set(false);
    }
  }

  cancel(): void {
    this.dialogVisible.set(false);
  }

  onSelectionChange(users: SystemUser[] | null): void {
    const locked = this.lockedUserIds();
    const next = [...new Set([...(users ?? []).map((u) => String(u.id)), ...locked])];
    this.selectedUserIds.set(next);
  }

  save(): void {
    if (!this.hasChanges() || this.isSaving()) return;

    this.isSaving.set(true);
    this.squadsService.updateMembers(this.squadDetails().id, this.selectedUserIds()).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Squad members updated',
        });
        this.membersUpdated.emit([...this.selectedUserIds()]);
        this.dialogVisible.set(false);
        this.isSaving.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update squad members.',
        });
        this.isSaving.set(false);
      },
    });
  }

  isUserLocked(user: SystemUser): boolean {
    return user.id === this.squadDetails().productOwnerId || user.id === this.squadDetails().scrumMasterId;
  }

  getUserRoleBadge(user: SystemUser): string | null {
    if (user.id === this.squadDetails().productOwnerId) return 'PO';
    if (user.id === this.squadDetails().scrumMasterId) return 'Scrum Master';
    return null;
  }

  getInitials(name: string): string {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  getAvatarStyle(name: string): string {
    const colors = [
      'background-color: #F87171; color: white; font-size: 10px;',
      'background-color: #60A5FA; color: white; font-size: 10px;',
      'background-color: #34D399; color: white; font-size: 10px;',
      'background-color: #FBBF24; color: white; font-size: 10px;',
      'background-color: #A78BFA; color: white; font-size: 10px;',
      'background-color: #F472B6; color: white; font-size: 10px;',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  isUserDisabled = (user: SystemUser): boolean => this.isUserLocked(user);

  private initializeSelection(): void {
    const memberIds = this.currentMemberIds().map(String);
    const locked = this.lockedUserIds();
    const initial = [...new Set([...memberIds, ...locked])];
    this.originalMemberIds.set([...initial]);
    this.selectedUserIds.set([...initial]);
  }

  private loadUsers(): void {
    const cached = this.systemUsersService.users$();
    if (cached.length > 0) {
      this.allUsers.set(cached);
      return;
    }

    this.isUsersLoading.set(true);
    this.systemUsersService.getSystemUsers().subscribe({
      next: (users) => {
        this.allUsers.set(users);
        this.isUsersLoading.set(false);
      },
      error: () => {
        this.isUsersLoading.set(false);
      },
    });
  }
}
