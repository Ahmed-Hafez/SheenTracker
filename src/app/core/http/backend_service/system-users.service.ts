import { inject, Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiService } from '../api_services/api.service';
import { SystemUser } from '../../models/reponse/system-users.response.model';
// import { usersMock } from '../../mock/system-users.mock';
import { AddSystemUserRequest } from '../../models/request/add-system-user.request.model';

@Injectable({
  providedIn: 'root',
})
export class SystemUsersService {
  private usersEndpoint = 'AppUsers';

  private readonly apiService = inject(ApiService);

  private readonly allUsers = signal<SystemUser[]>([]);
  private readonly filteredUsers = signal<SystemUser[]>([]);

  users$ = this.filteredUsers.asReadonly();

  getAppUsers(): Observable<SystemUser[]> {
    return this.apiService.get<SystemUser[]>(this.usersEndpoint).pipe(
      map((response) => { this.allUsers.set(response); this.filteredUsers.set(response); return response; }),
    );
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
