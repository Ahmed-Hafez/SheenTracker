import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-azure-users-skeleton',
  standalone: true,
  imports: [SkeletonModule],
  templateUrl: './azure-users-skeleton.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AzureUsersSkeletonComponent {}
