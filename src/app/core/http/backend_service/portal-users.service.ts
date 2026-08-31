import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api_services/api.service';
import { SystemUser } from '../../models/reponse/system-users.response.model';
import { PortalUserResponse } from '../../models/reponse/portal-user.response.model';
import { map, Observable } from 'rxjs';
import { AddPortalUserRequest } from '../../models/request/add-portal-user.model';

@Injectable({
  providedIn: 'root',
})
export class PortalUsersService {
  private portalUsersEndpoint = 'PortalUsers';

  private readonly apiService = inject(ApiService);

  private readonly allUsers = signal<PortalUserResponse[]>([]);
  private readonly filteredUsers = signal<PortalUserResponse[]>([]);

  users$ = this.filteredUsers.asReadonly();

  fetchAllUsers(): Observable<PortalUserResponse[]> {
    return this.apiService.get<PortalUserResponse[]>(this.portalUsersEndpoint).pipe(
      map((response) => {
        this.allUsers.set(response);
        this.filteredUsers.set(response);
        return response;
      }),
    );
  }

  filterUsers(searchTerm: string): void {
    const filtered = this.allUsers().filter(
      (user) =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    this.filteredUsers.set(filtered);
  }

  getPortalUserById(userKey: number): Observable<PortalUserResponse> {
    return this.apiService.get<PortalUserResponse>(`${this.portalUsersEndpoint}/${userKey}`);
  }

  addPortalUser(userData: AddPortalUserRequest): Observable<PortalUserResponse> {
    return this.apiService.post(this.portalUsersEndpoint, userData);
  }

  updatePortalUser(
    userKey: number,
    userData: Partial<AddPortalUserRequest>,
  ): Observable<PortalUserResponse> {
    return this.apiService.put(`${this.portalUsersEndpoint}/${userKey}`, userData);
  }

  deletePortalUser(userKey: number): Observable<any> {
    return this.apiService.delete(`${this.portalUsersEndpoint}/${userKey}`);
  }

  activatePortalUser(userKey: number): Observable<PortalUserResponse> {
    return this.apiService.patch(`${this.portalUsersEndpoint}/${userKey}/activate`, null);
  }

  deactivatePortalUser(userKey: number): Observable<PortalUserResponse> {
    return this.apiService.patch(`${this.portalUsersEndpoint}/${userKey}/deactivate`, null);
  }
}
