import { Injectable, inject } from '@angular/core';
import { ApiService } from '../api_services/api.service';
import { Observable } from 'rxjs';
import { SystemUser } from '../../models/reponse/system-users.response.model';
import { AzureUserDetail } from '../../models/reponse/azure-user-details/user-details.response.model';

@Injectable({
  providedIn: 'root',
})
export class UserDetailsService {
  private readonly apiService = inject(ApiService);
  private systemUsersEndpoint = 'AppUsers/';
  private linkSystemUserEndpoint = 'AppUsers/link-azure-user';
  private azureUsersEndpoint(userId: string) {
    return `AzureDevOps/users/${userId}/work-items`;
  }

  getUserDetails(userId: string): Observable<AzureUserDetail> {
    return this.apiService.get<AzureUserDetail>(this.azureUsersEndpoint(userId));
  }

  getSystemUserDetails(userId: number | string): Observable<SystemUser> {
    return this.apiService.get<SystemUser>(`${this.systemUsersEndpoint}${userId}`);
  }

  linkAzureUser(appUserId: number, azureUserKey: string): Observable<any> {
    return this.apiService.post<any>(this.linkSystemUserEndpoint, { appUserId, azureUserKey });
  }
}
