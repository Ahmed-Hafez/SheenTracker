import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';
import { DividerModule } from 'primeng/divider';


@Component({
  selector: 'app-squads-skeleton',
  standalone: true,
  imports: [SkeletonModule , DividerModule],
  templateUrl: './squads-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SquadsSkeletonComponent {
  skeletonRows = Array(6).fill(null);
}
