import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { WorkItemsTableComponent } from '../../../work-items-table/work-items-table.component';

@Component({
  selector: 'app-work-items',
  standalone: true,
  imports: [WorkItemsTableComponent],
  templateUrl: './work-items.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkItemsComponent {
  workItems = input.required<any>();
}
