import { Component, computed, inject } from '@angular/core';
import { AreaPathComponent } from './area-path/area-path.component';
import { Router } from '@angular/router';
import { EpicsByAreaSkeletonComponent } from './epics-by-area-skeleton/epics-by-area-skeleton.component';
import { QuarterPlansService } from '../../../../../core/http/backend_service/quarter-plans.service';

@Component({
  selector: 'app-epics-by-area',
  imports: [AreaPathComponent, EpicsByAreaSkeletonComponent],
  templateUrl: './epics-by-area.component.html',
  styleUrl: './epics-by-area.component.scss',
})
export class EpicsByAreaComponent {
  constructor(private router: Router) {}

  navigateToAllEpics() {
    this.router.navigate(['/quarter-plans/all-epics']);
  }

  private readonly qPlansService = inject(QuarterPlansService);
  readonly isLoading = this.qPlansService.isLoading;

  epicsByArea = computed(() => this.qPlansService.qplansDashboardData().epicsByArea);

  ngOnInit() {
    console.log('epicsByArea', this.epicsByArea());
    console.log('qplansDashboardData', this.qPlansService.qplansDashboardData());
  }
}
