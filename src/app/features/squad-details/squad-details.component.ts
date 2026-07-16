import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Skeleton } from 'primeng/skeleton';

import { BreadcrumbModule, Breadcrumb } from 'primeng/breadcrumb';
import { SquadHeaderComponent } from './components/squad-header/squad-header.component';
import { SquadMembersTableComponent } from './components/squad-members-table/squad-members-table.component';
import { Squad } from '../../core/models/reponse/sqauds.response.model';
import { SquadsService } from '../../core/http/backend_service/squads.service';
import { DeletePopupComponent } from '../../shared/delete-popup/delete-popup.component';
import { SquadFormDialogComponent } from '../squads/components/squad-form-dialog/squad-form-dialog.component';
import { RefreshService } from '../../core/services/refresh.service';
import { of } from 'rxjs';
import { SquadDetailsSkeletonComponent } from "./components/squad-details-skeleton/squad-details-skeleton.component";

@Component({
  selector: 'app-squad-details',
  standalone: true,
  imports: [
    Breadcrumb,
    SquadHeaderComponent,
    SquadMembersTableComponent,
    DeletePopupComponent,
    SquadFormDialogComponent,
    SquadDetailsSkeletonComponent
],
  templateUrl: './squad-details.component.html',
})
export class SquadDetailsComponent implements OnInit {
  private readonly squadsService = inject(SquadsService);
  private readonly refreshService = inject(RefreshService);

  squadId = input<number>(0);
  sqaudDetails = signal<Squad>({} as Squad);
  items: MenuItem[] | undefined;

  isLoading = signal(true);

  squadDialogVisible = signal(false);
  deleteRequestVisible = signal(false);
  actionTaken = output<void>();

  ngOnInit() {
    this.loadSquadDetails();

    this.items = [{ label: 'Squads', routerLink: '/squads' }, { label: 'Squad Details' }];
  }

  loadSquadDetails() {
    this.isLoading.set(true);
    this.squadsService.getSquadById(this.squadId()).subscribe({
      next: (squad) => {
        console.log(squad);
        this.sqaudDetails.set(squad);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  showDeletePopup() {
    this.deleteRequestVisible.set(true);
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
    this.squadDialogVisible.set(true);
  }

  onDialogVisibleChange($event: boolean) {
    this.squadDialogVisible.set($event);
  }
}
