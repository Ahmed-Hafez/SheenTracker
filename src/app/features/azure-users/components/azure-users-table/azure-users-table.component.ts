import { Component, inject, input, OnInit, output, signal, viewChild } from '@angular/core';
import { User } from '../../../../core/models/reponse/azure-users.response.model';
import { TableModule } from 'primeng/table';
import { HoursBadgeComponent } from '../../../../shared/hours-badge/hours-badge.component';
import { Router } from '@angular/router';
import { Popover, PopoverModule } from 'primeng/popover';
import { DeletePopupComponent } from "../../../../shared/delete-popup/delete-popup.component";
import { Observable, of } from 'rxjs';


interface Column {
  field: string;
  header: string;
  width?: string;
}

@Component({
  selector: 'app-azure-users-table',
  imports: [
    TableModule,
    HoursBadgeComponent,
    PopoverModule,
  ],
  templateUrl: './azure-users-table.component.html',
})
export class AzureUsersTableComponent implements OnInit {
  private readonly router = inject(Router);

  users = input.required<User[]>();
  userDialogVisible = signal(false);
  deleteRequestVisible = signal(false);
  actionTaken = output<void>();

  popupMenu = viewChild<Popover>('op');

  selectedUser = signal<User | null>(null);

  columns!: Column[];

  ngOnInit(): void {
    this.columns = [
      { field: 'displayName', header: 'Name', width: '20%' },
      { field: 'email', header: 'Email', width: '25%' },
      { field: 'totalHours', header: 'Total Hours', width: '15%' },
      { field: 'projectsCount', header: 'Projects', width: '15%' },
      { field: 'workItemsCount', header: 'Work Items', width: '15%' },
      { field: 'Actions', header: 'Actions', width: '15%' },
    ];
  }

  fixDisplayName(name: string): string {
    return name.replace(/@?(?:tildetech.ae|shuratech.com)/gi, '').trim();
  }

  openMenuPopup(event: Event, user: User) {
    this.popupMenu()?.toggle(event);
    this.selectedUser.set(user);
  }

  showDetails(userKey : string) { 
    this.router.navigate(['/users', userKey]);
  }

  onImageError(event: Event, userkey: string) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'https://api.dicebear.com/9.x/personas/svg?seed=' + userkey;
  }

}
