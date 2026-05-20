import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-users-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './users-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersSkeletonComponent {}
