import { Component, effect, inject, input, OnChanges, OnInit, signal } from '@angular/core';
import { Avatar } from 'primeng/avatar';
import { Squad } from '../../../../core/models/reponse/sqauds.response.model';
import { Router } from '@angular/router';
import { SquadsService } from '../../../../core/http/backend_service/squads.service';
import { SystemUsersService } from '../../../../core/http/backend_service/system-users.service';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-squad-header',
  imports: [Avatar],
  templateUrl: './squad-header.component.html',
})
export class SquadHeaderComponent implements OnChanges {
  private readonly router = inject(Router);
  private readonly squadService = inject(SquadsService);
  private readonly systemUserService = inject(SystemUsersService);

  sqaudDetails = input.required<Squad>();
  ScrumMasterEmail = signal('');
  ScrumMasterUserKey = signal<string | null>(null);
  ProductOwnerEmail = signal('');
  ProductOwnerUserKey = signal<string | null>(null);

  ngOnChanges() {
  const { scrumMasterId, productOwnerId } = this.sqaudDetails() ?? {};

  if (scrumMasterId) {
    this.getEmailAndUserkey(scrumMasterId).subscribe(({ email, userKey }) => {
      this.ScrumMasterEmail.set(email);
      this.ScrumMasterUserKey.set(userKey);
    });
  }

  if (productOwnerId) {
    this.getEmailAndUserkey(productOwnerId).subscribe(({ email, userKey }) => {
      this.ProductOwnerEmail.set(email);
      this.ProductOwnerUserKey.set(userKey);
    });
  }
}
  getEmailAndUserkey(userId: number): Observable<{ email: string; userKey: string | null }> {
    return this.systemUserService
      .getSystemUserByKey(userId)
      .pipe(map((response) => ({ email: response.email, userKey: response.azureUserKey })));
  }

  navigateToUser(userId: number | undefined, userKey: string | null) {
    this.router.navigate(['users'], {
      queryParams: userKey ? { userKey: userKey } : { userId: userId },
    });
  }

  pickRandomColor(name: string): string {
    const colors = [
      'background-color: #F87171; color: white; font-size: 15px;', // Red
      'background-color: #60A5FA; color: white; font-size: 15px;', // Blue
      'background-color: #34D399; color: white; font-size: 15px;', // Green
      'background-color: #FBBF24; color: white; font-size: 15px;', // Yellow
      'background-color: #A78BFA; color: white; font-size: 15px;', // Purple
      'background-color: #F472B6; color: white; font-size: 15px;', // Pink
    ];
    // Simple hash function to get a consistent color for the same name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  getInitials(name: string) {
    let splitedname = name.split(' ');
    return splitedname[0][0] + splitedname[1][0];
  }
}
