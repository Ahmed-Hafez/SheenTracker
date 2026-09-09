import { Component } from '@angular/core';

@Component({
  selector: 'app-epics-by-task-type-skeleton',
  imports: [],
  templateUrl: './epics-by-task-type-skeleton.component.html',
  styleUrl: './epics-by-task-type-skeleton.component.scss',
})
export class EpicsByTaskTypeSkeletonComponent {
  readonly tiles = Array.from({ length: 6 });
}
