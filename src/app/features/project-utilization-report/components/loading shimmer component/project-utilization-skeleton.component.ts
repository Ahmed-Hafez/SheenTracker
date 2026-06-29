import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-project-utilization-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './project-utilization-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectUtilizationSkeletonComponent {
  readonly rows = Array.from({ length: 6 }, (_, i) => i);
}
