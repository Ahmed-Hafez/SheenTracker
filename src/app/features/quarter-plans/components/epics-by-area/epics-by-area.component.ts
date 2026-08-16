import { Component } from '@angular/core';
import { AreaPathComponent } from './area-path/area-path.component';

@Component({
  selector: 'app-epics-by-area',
  imports: [AreaPathComponent],
  templateUrl: './epics-by-area.component.html',
  styleUrl: './epics-by-area.component.scss',
})
export class EpicsByAreaComponent {}
