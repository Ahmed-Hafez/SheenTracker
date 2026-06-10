import { Component, ChangeDetectionStrategy, input, signal, viewChild, output, inject } from '@angular/core';
import { HoursBadgeComponent } from '../../../../shared/hours-badge/hours-badge.component';
import { Popover } from "primeng/popover";
import { SystemUser } from '../../../../core/models/reponse/system-users.response.model';
import { UserFormDialogComponent } from "../../../../shared/user-form-dialog/user-form-dialog.component";
import { DeletePopupComponent } from "../../../../shared/delete-popup/delete-popup.component";
import { of } from 'rxjs';
import { SystemUsersService } from '../../../../core/http/backend_service/system-users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HoursBadgeComponent, Popover, UserFormDialogComponent, DeletePopupComponent],
  templateUrl: './user-card.component.html',
  styles: ``,
})
export class UserCardComponent {

  user = input.required<{
    name: string;
    initials: string;
    email1: string;
    email2: string;
    avatarUrl: string;
    totalHours: number;
  }>();

  showLinkSystemToAzureButton = input.required<boolean>();
  linkAzureUser = input.required<() => void>();
  foundAzureUserEmail = input.required<string | null>();
  systemUserId= input.required<number | null | undefined>();
  systemUser = input.required<SystemUser | null>();
  popupMenu = viewChild<Popover>('op');
  userDialogVisible = signal(false);
  deleteRequestVisible = signal(false);
  // actionTaken = output<void>();
  systemUsersService = inject(SystemUsersService);
  systemUsersList = this.systemUsersService.users$;
  deleteUser = input.required<(userKey: number | undefined) => any>();
  router = inject(Router);


  deleteActionTaken(event$: boolean) {
    this.deleteRequestVisible.set(false);
    if(event$) {
      this.router.navigate(['/users', 'system']);
    }
  }


  excecuteLinkAzureUser() {
    console.log("Link Azure User button clicked");
    if (this.linkAzureUser) {
      const x: void =this.linkAzureUser()();
    }
  }

  onDialogVisibleChange($event: boolean) {
    this.userDialogVisible.set($event);
  }


    showDeletePopup() {
    this.deleteRequestVisible.set(true);
    this.popupMenu()?.hide();
  }

  showEditUserPopup() {
    this.userDialogVisible.set(true);
  }

   closeDeletePopup($event: boolean) {
    this.deleteRequestVisible.set($event);
    window.location.reload();
  }

  fixDisplayName(name: string): string {
    return name.replace(/@?(?:tildetech.ae|shuratech.com)/gi, '').trim();
  }

   openMenuPopup(event: Event, user: SystemUser) {
    console.log('Selected User:', user);
    this.popupMenu()?.toggle(event);
  }


  hasImageError = signal(false);

}
