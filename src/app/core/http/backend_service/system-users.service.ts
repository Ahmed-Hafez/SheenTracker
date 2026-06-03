import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api_services/api.service';
import { SystemUsers } from '../../models/reponse/system-users.response.model';
import { usersMock } from '../../mock/system-users.mock';

@Injectable({
  providedIn: 'root',
})
export class SystemUsersService {
  private usersEndpoint = 'AppUsers';

  private readonly apiService = inject(ApiService);

  private readonly allUsers = signal<SystemUsers[]>([]);
  private readonly filteredUsers = signal<SystemUsers[]>(usersMock);
  private readonly usersProjects = signal<SystemUsers[]>([]);

  users$ = this.filteredUsers.asReadonly();
  projects$ = this.usersProjects.asReadonly();

  getAppUsers(): Observable<SystemUsers[]> {
    return this.apiService.get(this.usersEndpoint);
  }

  getAppUserByKey(userKey: string): Observable<SystemUsers> {
    return this.apiService.get(`${this.usersEndpoint}/${userKey}`);
  }

  addAppUser(userData: SystemUsers): Observable<any> {
    return this.apiService.post(this.usersEndpoint, userData);
  }

  updateAppUser(userKey: string, userData: SystemUsers): Observable<any> {
    return this.apiService.put(`${this.usersEndpoint}/${userKey}`, userData);
  }

  deleteAppUser(userKey: string): Observable<any> {
    return this.apiService.delete(`${this.usersEndpoint}/${userKey}`);
  }
}
