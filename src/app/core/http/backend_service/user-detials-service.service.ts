import { Injectable, signal } from '@angular/core';
import { userDetailsMock } from '../../mock/user-details.mock';
import { UserDetailsResponse } from '../../models/reponse/user-details.response.model';

@Injectable({
  providedIn: 'root'
})
export class UserDetailsService {
  private readonly userDetailsState = signal<UserDetailsResponse | null>(null);

  userDetails$ = this.userDetailsState.asReadonly();

  getUserDetails(userId: string) {
    // Implement API call to fetch user details data based on userId
    // Mock for now
    this.userDetailsState.set(userDetailsMock);
    return this.userDetails$();
  }
}
