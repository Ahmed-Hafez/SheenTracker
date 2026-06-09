import { Injectable, inject } from '@angular/core';
import { UserDetailsResponse } from '../../models/reponse/user-details.response.model';
import { ApiService } from '../api_services/api.service';
import { Observable } from 'rxjs';
import { AchievementResponse } from '../../models/reponse/achievemetsResponse.model';
import { SystemUser } from '../../models/reponse/system-users.response.model';

@Injectable({
  providedIn: 'root',
})
export class UserDetailsService {
  private readonly apiService = inject(ApiService);

  getUserDetails(userId: string): Observable<UserDetailsResponse> {
    return this.apiService.get<UserDetailsResponse>(`AzureDevOps/users/${userId}/work-items`);
  }

  getAzureUserAchievements(userKey: string): Observable<AchievementResponse>{
    return this.apiService.get<AchievementResponse>(`AzureDevOps/user-achievements?userKey=${userKey}&&`);
  }

  getSystemUserDetails(userId: number| string): Observable<SystemUser> {
    return this.apiService.get<SystemUser>(`AppUsers/${userId}`);
  }

  linkAzureUser(appUserId: number, azureUserKey: string): Observable<any> {
    return this.apiService.post<any>(`AppUsers/link-azure-user`, { appUserId, azureUserKey });
  }
}
