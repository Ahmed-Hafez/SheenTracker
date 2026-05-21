import { Injectable, inject } from '@angular/core';
import { UserDetailsResponse } from '../../models/reponse/user-details.response.model';
import { ApiService } from '../api_services/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserDetailsService {
  private readonly apiService = inject(ApiService);

  getUserDetails(userId: string): Observable<UserDetailsResponse> {
    return this.apiService.get<UserDetailsResponse>(`AzureDevOps/users/${userId}/work-items`);
  }
}
