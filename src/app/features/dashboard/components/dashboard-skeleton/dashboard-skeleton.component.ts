import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-dashboard-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './dashboard-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSkeletonComponent {}
