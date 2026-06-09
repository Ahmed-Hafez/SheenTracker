import { inject, Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiService } from '../api_services/api.service';
import { SystemUser } from '../../models/reponse/system-users.response.model';
import { AddSystemUserRequest } from '../../models/request/add-system-user.request.model';
import { Department } from '../../enums/departments.enum';
import { usersMock } from '../../mock/system-users.mock';

@Injectable({
  providedIn: 'root',
})
export class SystemUsersService {
  private usersEndpoint = 'AppUsers';

  private readonly apiService = inject(ApiService);

  private readonly allUsers = signal<SystemUser[]>([]);
  private readonly filteredUsers = signal<SystemUser[]>([]);

  users$ = this.filteredUsers.asReadonly();

  getSystemUsers(): Observable<SystemUser[]> {
    return this.apiService.get<SystemUser[]>(this.usersEndpoint).pipe(
      map((response) => {
        this.allUsers.set(response);
        this.filteredUsers.set(response);
        return response;
      }),
    );
  }

  filterUsers(
    searchTerm: string,
    squad: number,
    department: number,
    userType: 'Linked' | 'UnLinked',
  ): void {
    let filteredUsers = this.allUsers();
    if (searchTerm) {
      filteredUsers = filteredUsers.filter((user) =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (squad) {
      filteredUsers = filteredUsers.filter((user) => user.squad === squad);
    }
    if (department) {
      filteredUsers = filteredUsers.filter((user) => user.department === department);
    }
    if (userType) {
      if (userType === 'Linked') {
        filteredUsers = filteredUsers.filter((user) => user.azureUserKey !== null);
      } else {
        filteredUsers = filteredUsers.filter((user) => user.azureUserKey === null);
      }
    }
    this.filteredUsers.set(filteredUsers);
  }

  getSystemTeamLeads(departmentId: number): Observable<SystemUser[]> {
    return this.apiService.get<SystemUser[]>(`${this.usersEndpoint}`);
  }

  getSystemUserByKey(userKey: number): Observable<SystemUser> {
    return this.apiService.get(`${this.usersEndpoint}/${userKey}`);
  }

  addAppUser(userData: AddSystemUserRequest): Observable<any> {
    return this.apiService.post(this.usersEndpoint, userData);
  }

  updateAppUser(userKey: number, userData: AddSystemUserRequest): Observable<any> {
    return this.apiService.put(`${this.usersEndpoint}/${userKey}`, userData);
  }

  deleteAppUser(userKey: number): Observable<any> {
    return this.apiService.delete(`${this.usersEndpoint}/${userKey}`);
  }
}
