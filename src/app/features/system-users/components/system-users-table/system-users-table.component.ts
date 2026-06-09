import { Component, inject, input, OnInit, output, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { TableModule } from 'primeng/table';
import { Popover, PopoverModule } from 'primeng/popover';
import { TagModule } from 'primeng/tag';

import { UserFormDialogComponent } from '../user-form-dialog/user-form-dialog.component';
import { DeletePopupComponent } from '../../../../shared/delete-popup/delete-popup.component';
import { SystemUsersService } from '../../../../core/http/backend_service/system-users.service';
import { SystemUserDetails } from '../../../../core/models/reponse/system-user-details.response.model';

interface Column {
  field: string;
  header: string;
  width?: string;
}

@Component({
  selector: 'app-system-users-table',
  imports: [TableModule, PopoverModule, UserFormDialogComponent, DeletePopupComponent, TagModule],
  templateUrl: './system-users-table.component.html',
})
export class SystemUsersTableComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly appUsersService = inject(SystemUsersService);

  users = input.required<SystemUserDetails[]>();
  userDialogVisible = signal(false);
  deleteRequestVisible = signal(false);
  actionTaken = output<void>();

  popupMenu = viewChild<Popover>('op');

  selectedUser = signal<SystemUserDetails | null>(null);

  columns!: Column[];

  ngOnInit(): void {
    this.initializeTableColumns();
  }

  initializeTableColumns() {
    this.columns = [
      { field: 'fullName', header: 'Name' },
      { field: 'email', header: 'Email' },
      { field: 'department', header: 'Department' },
      { field: 'sqaud', header: 'Squad' },
      { field: 'jobTitle', header: 'Job Title' },
      { field: 'azure', header: 'Azure User' },
      { field: 'Actions', header: 'Actions' },
    ];
  }

  fixDisplayName(name: string): string {
    return name.replace(/@?(?:tildetech.ae|shuratech.com)/gi, '').trim();
  }

  openMenuPopup(event: Event, user: SystemUserDetails) {
    console.log('Selected User:', user);
    this.popupMenu()?.toggle(event);
    this.selectedUser.set(user);
  }

  callActions(userId: number, index: number): void {
    switch (index) {
      case 0:
        this.router.navigate(['users'], { queryParams: { userId: userId } });
        break;
      case 1:
        this.showEditUserPopup();
        break;
      case 2:
        this.showDeletePopup();
        break;
    }
  }

  onImageError(event: Event, userkey: string) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'https://api.dicebear.com/9.x/personas/svg?seed=' + userkey;
  }

  showDeletePopup() {
    this.deleteRequestVisible.set(true);
    this.popupMenu()?.hide();
  }

  closeDeletePopup($event: boolean) {
    this.deleteRequestVisible.set($event);
  }

  deleteUser(userKey: number | undefined) {
    if (!userKey) {
      return of(null);
    }
    // Implement the actual API call to delete the user
    return this.appUsersService.deleteAppUser(userKey);
  }

  showEditUserPopup() {
    console.log('Selected User:', this.selectedUser());

    this.userDialogVisible.set(true);
  }

  onDialogVisibleChange($event: boolean) {
    this.userDialogVisible.set($event);
  }
}
