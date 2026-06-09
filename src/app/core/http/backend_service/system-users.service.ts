import { inject, Injectable, signal } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiService } from '../api_services/api.service';
import { SystemUserDetails } from '../../models/reponse/system-user-details.response.model';
// import { usersMock } from '../../mock/system-users.mock';
import { AddSystemUserRequest } from '../../models/request/add-system-user.request.model';

@Injectable({
  providedIn: 'root',
})
export class SystemUsersService {
  private usersEndpoint = 'AppUsers';

  private readonly apiService = inject(ApiService);

  private readonly allUsers = signal<SystemUserDetails[]>([]);
  private readonly filteredUsers = signal<SystemUserDetails[]>([]);

  users$ = this.filteredUsers.asReadonly();

  getAppUsers(): Observable<SystemUserDetails[]> {
    return this.apiService.get<SystemUserDetails[]>(this.usersEndpoint).pipe(
      map((response) => {
        this.allUsers.set(response);
        this.filteredUsers.set(response);
        return response;
      }),
    );
  }

  getSystemUserByKey(userKey: number): Observable<SystemUserDetails> {
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
