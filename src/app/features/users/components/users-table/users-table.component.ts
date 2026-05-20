import { Component, inject, input, OnInit } from '@angular/core';
import { User } from '../../../../core/models/reponse/users.response.model';
import { TableModule } from 'primeng/table';
import { HoursBadgeComponent } from '../../../../shared/hours-badge/hours-badge.component';
import { Router } from '@angular/router';

interface Column {
  field: string;
  header: string;
  width?: string;
}

@Component({
  selector: 'app-users-table',
  imports: [TableModule, HoursBadgeComponent],
  templateUrl: './users-table.component.html',
  styleUrl: './users-table.component.scss',
})
export class UsersTableComponent implements OnInit {
  private readonly router = inject(Router);
  users = input.required<User[]>();

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

  onDetails(userkey: string): void {
    this.router.navigate(['users', userkey]);
  }
}
