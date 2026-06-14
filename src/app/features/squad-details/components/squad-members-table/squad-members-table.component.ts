import { Component, computed, inject, input, OnInit, output, viewChild } from '@angular/core';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { EnumLabelPipe } from '../../../../core/pipes/enum-label-pipe';
import { Avatar } from 'primeng/avatar';
import { Seniorities } from '../../../../core/enums/seniority.enum';
import { Column } from '../../../squads/components/squads-table/squads-table.component';
import { SystemUser } from '../../../../core/models/reponse/system-users.response.model';
import { Departments } from '../../../../core/enums/departments.enum';
import { ManageMembersDialogComponent } from '../manage-members-dialog/manage-members-dialog.component';
import { Squad } from '../../../../core/models/reponse/sqauds.response.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-squad-members-table',
  imports: [TableModule, Tag, EnumLabelPipe, Avatar, ManageMembersDialogComponent],
  templateUrl: './squad-members-table.component.html',
})
export class SquadMembersTableComponent implements OnInit {
  router = inject(Router);
  squadDetails = input.required<Squad>();
  selectedMember!: SystemUser;

  membersUpdated = output<string[]>();

  manageMembersDialog = viewChild.required(ManageMembersDialogComponent);

  currentMemberIds = computed(() => this.squadDetails().users.map((user) => user.id));

  columns!: Column[];
  seniorities = Seniorities;
  departments = Departments;

  ngOnInit(): void {
    this.initializeTableColumns();
  }

  getInitials(name: string) {
    let splitedname = name.split(' ');
    return splitedname[0][0] + splitedname[1][0];
  }

  pickRandomColor(name: string): string {
    const colors = [
      'background-color: #F87171; color: white; font-size: 10px;', // Red
      'background-color: #60A5FA; color: white; font-size: 10px;', // Blue
      'background-color: #34D399; color: white; font-size: 10px;', // Green
      'background-color: #FBBF24; color: white; font-size: 10px;', // Yellow
      'background-color: #A78BFA; color: white; font-size: 10px;', // Purple
      'background-color: #F472B6; color: white; font-size: 10px;', // Pink
    ];
    // Simple hash function to get a consistent color for the same name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  navigateToUser(): void {
    this.router.navigate(['users'], {
      queryParams: this.selectedMember.azureUserKey ? { userKey: this.selectedMember.azureUserKey } : { userId: this.selectedMember.id },
    });
  }

  openManageMembersDialog(): void {
    this.manageMembersDialog().open();
  }

  onMembersUpdated(memberIds: string[]): void {
    this.membersUpdated.emit(memberIds);
  }

  initializeTableColumns() {
    this.columns = [
      { field: 'fullName', header: 'Name' },
      { field: 'department', header: 'Department' },
      { field: 'jobTitle', header: 'Job Title' },
      { field: 'azure', header: 'Azure User' },
    ];
  }
}
