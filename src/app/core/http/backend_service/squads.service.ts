import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from '../api_services/api.service';
import { Squad } from '../../models/reponse/sqauds.response.model';
import { map, Observable } from 'rxjs';
import { AddSquadRequest } from '../../models/request/add-squad.request.model';
import { SystemUsersService } from './system-users.service';

@Injectable({
  providedIn: 'root',
})
export class SquadsService {
  private squadsEndpoint = 'squads';

  private readonly apiService = inject(ApiService);
  private readonly systemUserService = inject(SystemUsersService);

  private readonly allSquads = signal<Squad[]>([]);
  private readonly filteredSquads = signal<Squad[]>([]);

  filteredSquads$ = this.filteredSquads.asReadonly();

  getSquads(): Observable<Squad[]> {
    return this.apiService.get<any>(this.squadsEndpoint).pipe(
      map((response) => {
        this.allSquads.set(response.data.items);
        this.filteredSquads.set(response.data.items);
        return response.data;
      }),
    );
  }

  filterSquads(searchTerm: string): void {
    const filteredSquads = this.allSquads().filter((squad) =>
      squad.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    this.filteredSquads.set(filteredSquads);
  }

  getSquadById(squadId: number): Observable<Squad> {
    return this.apiService
      .get<any>(`${this.squadsEndpoint}/${squadId}`)
      .pipe(map((response) => response.data));
  }

  getEmailAndUserkey(userId: number): Observable<{ email: string; userKey: string | null }> {
    return this.systemUserService
      .getSystemUserByKey(userId)
      .pipe(map((response) => ({ email: response.email, userKey: response.azureUserKey})));
  }

  addSquad(userData: AddSquadRequest): Observable<any> {
    return this.apiService.post(this.squadsEndpoint, userData);
  }

  updateSquad(userKey: number, userData: AddSquadRequest): Observable<any> {
    return this.apiService.put(`${this.squadsEndpoint}/${userKey}`, userData);
  }

  deleteSquad(userKey: number): Observable<any> {
    return this.apiService.delete(`${this.squadsEndpoint}/${userKey}`);
  }

  updateMembers(squadId: number, memberIds: string[]): Observable<any> {
    return this.apiService.post(`${this.squadsEndpoint}/${squadId}/users`, {
      userIds: memberIds.map(Number),
    });
  }
}
