import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api_services/api.service';
import { ProjectUtilizationResponse } from '../../models/reponse/project-utilization.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProjectsUtilizationReportService {
  private readonly apiService = inject(ApiService);

  private projectsEndpoint = 'AzureDevOps/projects-statistics';

  getProjectUtilizationData(): Observable<ProjectUtilizationResponse> {
    return this.apiService.get<ProjectUtilizationResponse>(this.projectsEndpoint);
  }
}
