import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-squad-details-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './squad-details-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SquadDetailsSkeletonComponent {}
