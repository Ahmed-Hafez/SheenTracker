import { Component, inject, input, OnInit, output, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { TableModule } from 'primeng/table';
import { Popover, PopoverModule } from 'primeng/popover';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';

import { SquadFormDialogComponent } from '../squad-form-dialog/squad-form-dialog.component';
import { DeletePopupComponent } from '../../../../shared/delete-popup/delete-popup.component';
import { SystemUsersService } from '../../../../core/http/backend_service/system-users.service';
import { RefreshService } from '../../../../core/services/refresh.service';
import { SystemUser } from '../../../../core/models/reponse/system-users.response.model';
import { EnumLabelPipe } from '../../../../core/pipes/enum-label-pipe';
import { Seniorities } from '../../../../core/enums/seniority.enum';
import { Departments } from '../../../../core/enums/departments.enum';
import { SquadsService } from '../../../../core/http/backend_service/squads.service';
import { Squad } from '../../../../core/models/reponse/sqauds.response.model';
import { getInitialsFromName } from '../../../../core/utils/get-initials.util';
import { pickRandomColor as pickAvatarColorStyle } from '../../../../core/utils/pick-random-color.util';

export interface Column {
  field: string;
  header: string;
  width?: string;
}

@Component({
  selector: 'app-squads-table',
  imports: [
    TableModule,
    PopoverModule,
    SquadFormDialogComponent,
    DeletePopupComponent,
    TagModule,
    AvatarModule,
  ],
  templateUrl: './squads-table.component.html',
})
export class SquadsTableComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly squadsService = inject(SquadsService);
  private readonly refreshService = inject(RefreshService);

  squads = input.required<Squad[]>();
  squadDialogVisible = signal(false);
  deleteRequestVisible = signal(false);
  actionTaken = output<void>();

  popupMenu = viewChild<Popover>('op');

  selectedSquad = signal<Squad | null>(null);

  columns!: Column[];
  seniorities = Seniorities;
  departments = Departments;
  readonly getInitials = getInitialsFromName;
  readonly pickRandomColor = (name: string) => pickAvatarColorStyle(name, '10px');

  ngOnInit(): void {
    this.initializeTableColumns();
  }

  initializeTableColumns() {
    this.columns = [
      { field: 'name', header: 'Squad Name' },
      { field: 'productOwnerId', header: 'Product Owner' },
      { field: 'scrumMasterId', header: 'Scrum Master' },
      { field: 'membersCount', header: 'Members' },
      { field: 'actions', header: 'Actions' },
    ];
  }

  openMenuPopup(event: Event, squad: Squad) {
    console.log('Selected Squad:', squad);
    this.popupMenu()?.toggle(event);
    this.selectedSquad.set(squad);
  }

  callActions(index: number): void {
    switch (index) {
      case 0:
        this.router.navigate(['squads', this.selectedSquad()?.id]);
        break;
      case 1:
        this.showEditSquadPopup();
        break;
      case 2:
        this.showDeletePopup();
        break;
    }
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

  deleteSquad(squadId: number | undefined) {
    if (!squadId) {
      return of(null);
    }
    // Implement the actual API call to delete the user
    return this.squadsService.deleteSquad(squadId);
  }

  showEditSquadPopup() {
    console.log('Selected Squad:', this.selectedSquad());

    this.squadDialogVisible.set(true);
  }

  onDialogVisibleChange($event: boolean) {
    this.squadDialogVisible.set($event);
  }
}
