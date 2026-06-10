import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-squads-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './squads-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SquadsSkeletonComponent {}
