import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api_services/api.service';
import { AzureUsers, User } from '../../models/reponse/azure-users.response.model';
import { filter, map, Observable } from 'rxjs';
import { Squad } from '../../models/reponse/sqauds.response.model';

interface AzureUsersKpis {
  totalUsers: number;
  usersWithHours: number;
  inActiveUsers: number;
}
interface MetaDataUser {
  fullName: string;
  userKey: string;
  email: string;
}

interface MetaDataSquad {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root',
})
export class MetaDataService {
  private readonly apiService = inject(ApiService);

  private usersEndpoint = 'AzureDevOps/users';

  private readonly metaDataUsers = signal<MetaDataUser[]>([]);
  metaDataUsers$ = this.metaDataUsers.asReadonly();

  private readonly metaDataSquads = signal<MetaDataSquad[]>([]);
  metaDataSquads$ = this.metaDataSquads.asReadonly();

  private readonly usersKpis = signal<AzureUsersKpis>({} as AzureUsersKpis);
  usersKpis$ = this.usersKpis.asReadonly();

  isUsersLoading = signal(false);
  isSquadsLoading = signal(false);

  getAzureUsersMetaData(): Observable<any> {
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

        const kpis: AzureUsersKpis = {
          totalUsers: users.length,
          usersWithHours: azureUsers.usersWithHours,
          inActiveUsers: users.length - azureUsers.usersWithHours,
        };

        this.usersKpis.set(kpis);
      }),
    );
  }

  getSquads(): Observable<MetaDataSquad[]> {
    return this.apiService.get<any>('squads').pipe(
      map((response) => {
        const metaDataSquads: MetaDataSquad[] = response.data.items.map((squad: Squad) => ({
          id: squad.id,
          name: squad.name,
        }));
        this.metaDataSquads.set(metaDataSquads);
        return metaDataSquads;
      }),
    );
  }
}
