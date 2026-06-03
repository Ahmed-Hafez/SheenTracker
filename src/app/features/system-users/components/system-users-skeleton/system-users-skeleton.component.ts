import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-system-users-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './system-users-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SystemUsersSkeletonComponent {}
