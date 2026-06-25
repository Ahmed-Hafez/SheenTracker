import { Component, inject, input, OnInit, output, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { TableModule } from 'primeng/table';
import { Popover, PopoverModule } from 'primeng/popover';
import { TagModule } from 'primeng/tag';

import { UserFormDialogComponent } from '../../../../shared/user-form-dialog/user-form-dialog.component';
import { DeletePopupComponent } from '../../../../shared/delete-popup/delete-popup.component';
import { SystemUsersService } from '../../../../core/http/backend_service/system-users.service';
import { RefreshService } from '../../../../core/services/refresh.service';
import { SystemUser } from '../../../../core/models/reponse/system-users.response.model';
import { EnumLabelPipe } from '../../../../core/pipes/enum-label-pipe';
import { Seniorities } from '../../../../core/enums/seniority.enum';
import { Departments } from '../../../../core/enums/departments.enum';

interface Column {
  field: string;
  header: string;
  width?: string;
}

@Component({
  selector: 'app-system-users-table',
  imports: [
    TableModule,
    PopoverModule,
    UserFormDialogComponent,
    DeletePopupComponent,
    TagModule,
    EnumLabelPipe,
  ],
  templateUrl: './system-users-table.component.html',
})
export class SystemUsersTableComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly appUsersService = inject(SystemUsersService);
  private readonly refreshService = inject(RefreshService);

  users = input.required<SystemUser[]>();
  userDialogVisible = signal(false);
  deleteRequestVisible = signal(false);
  actionTaken = output<void>();

  popupMenu = viewChild<Popover>('op');
  first = 0;

  selectedUser = signal<SystemUser | null>(null);

  columns!: Column[];
  seniorities = Seniorities;
  departments = Departments;

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

  openMenuPopup(event: Event, user: SystemUser) {
    console.log('Selected User:', user);
    this.popupMenu()?.toggle(event);
    this.selectedUser.set(user);
  }

  resetToFirstPage() {
    this.first = 0;
  }

  callActions(index: number): void {
    switch (index) {
      case 0:
        this.router.navigate(['users'], {
          queryParams: this.selectedUser()?.azureUserKey
            ? { userKey: this.selectedUser()?.azureUserKey }
            : { userId: this.selectedUser()?.id },
        });
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
    if (!$event) {
      this.refreshService.trigger();
    }
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
