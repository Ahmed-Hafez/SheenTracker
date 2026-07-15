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
import { getInitialsFromName } from '../../../../core/utils/get-initials.util';
import { pickRandomColor as pickAvatarColorStyle } from '../../../../core/utils/pick-random-color.util';

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
  readonly getInitials = getInitialsFromName;
  readonly pickRandomColor = (name: string) => pickAvatarColorStyle(name, '10px');

  ngOnInit(): void {
    this.initializeTableColumns();
  }

  navigateToUser(): void {
    this.router.navigate(['users'], {
      queryParams: this.selectedMember.azureUserKey
        ? { userKey: this.selectedMember.azureUserKey }
        : { userId: this.selectedMember.id },
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
