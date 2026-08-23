import { Component, input } from '@angular/core';
import { EpicsByArea } from '../../../../../../core/models/reponse/quarter-plans-dashboard.response';

@Component({
  selector: 'app-area-path',
  imports: [],
  templateUrl: './area-path.component.html',
  styleUrl: './area-path.component.scss',
})
export class AreaPathComponent {
  areaPath = input.required<EpicsByArea>();
}
