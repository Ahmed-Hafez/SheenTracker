import { Component } from '@angular/core';

@Component({
  selector: 'app-epics-by-area-skeleton',
  imports: [],
  templateUrl: './epics-by-area-skeleton.component.html',
  styleUrl: './epics-by-area-skeleton.component.scss',
})
export class EpicsByAreaSkeletonComponent {
  readonly tiles = Array.from({ length: 6 });
}
