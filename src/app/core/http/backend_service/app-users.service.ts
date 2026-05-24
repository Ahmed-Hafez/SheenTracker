import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api_services/api.service';
import { AppUser } from '../../models/reponse/users.response.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppUsersService {
  private readonly apiService = inject(ApiService);
  private usersEndpoint = 'AppUsers';


  getAppUsers() : Observable<AppUser[]> {
    return this.apiService.get(this.usersEndpoint);
  }

  getAppUserByKey(userKey: string) : Observable<AppUser> {
    return this.apiService.get(`${this.usersEndpoint}/${userKey}`);
  }

  addAppUser(userData: AppUser) : Observable<any> {
    return this.apiService.post(this.usersEndpoint, userData);
  }

  updateAppUser(userKey: string, userData: AppUser) : Observable<any> {
    return this.apiService.put(`${this.usersEndpoint}/${userKey}`, userData);
  }

  deleteAppUser(userKey: string) : Observable<any> {
    return this.apiService.delete(`${this.usersEndpoint}/${userKey}`);
  }
}
