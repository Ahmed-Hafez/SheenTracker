import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api_services/api.service';
import { AzureUsers, User } from '../../models/reponse/azure-users.response.model';
import { filter, map, Observable } from 'rxjs';

interface MetaDataUser {
  fullName: string;
  userKey: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class MetaDataService {
  private readonly apiService = inject(ApiService);

  private usersEndpoint = 'AzureDevOps/users';

  private readonly metaDataUsers = signal<MetaDataUser[]>([]);
  metaDataUsers$ = this.metaDataUsers.asReadonly();

  isLoading = signal(false);

  getAzureUsers(): Observable<MetaDataUser[]> {
   
    return this.apiService.get<AzureUsers>(this.usersEndpoint).pipe(
      map((azureUsers) => {
        const users = azureUsers.users.map((user) => ({
          fullName: user.displayName.replace(/@?(?:tildetech.ae|shuratech.com)/gi, '').trim(),
          userKey: user.userKey,
          email: user.email,
        }));
        
        users.forEach((user) => {
          if (user.fullName.includes('(tilde-technology)') === false) {
            this.metaDataUsers.update((users) => [...users, user]);
          }
        });
        
        return users;
      }),
    );
  }
}
