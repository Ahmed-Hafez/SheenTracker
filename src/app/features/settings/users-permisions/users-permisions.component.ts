import { Component, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { AuthUserFormDialogComponent } from './auth-user-form-dialog/auth-user-form-dialog.component';

@Component({
  selector: 'app-users-permisions',
  imports: [TableModule, AuthUserFormDialogComponent],
  templateUrl: './users-permisions.component.html',
  styleUrl: './users-permisions.component.scss',
})
export class UsersPermisionsComponent {
  products!: String[];

  userDialogVisible = signal(false);

  showUserPopup() {
    this.userDialogVisible.set(true);
  }

  onDialogVisibleChange($event: boolean) {
    this.userDialogVisible.set($event);
  }
}
