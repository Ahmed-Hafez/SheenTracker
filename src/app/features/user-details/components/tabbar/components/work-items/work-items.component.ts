import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { WorkItemsTableComponent } from '../../../work-items-table/work-items-table.component';
import {
  ProjectDetail,
  WorkItemDetail,
} from '../../../../../../core/models/reponse/azure-user-details/user-workItems.model';

@Component({
  selector: 'app-work-items',
  standalone: true,
  imports: [WorkItemsTableComponent],
  templateUrl: './work-items.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkItemsComponent {
  workItems = input.required<ProjectDetail[]>();
}
