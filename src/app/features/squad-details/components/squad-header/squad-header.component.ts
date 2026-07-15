import { Component, effect, inject, input, OnChanges, OnInit, signal } from '@angular/core';
import { Avatar } from 'primeng/avatar';
import { Squad } from '../../../../core/models/reponse/sqauds.response.model';
import { Router } from '@angular/router';
import { SquadsService } from '../../../../core/http/backend_service/squads.service';
import { SystemUsersService } from '../../../../core/http/backend_service/system-users.service';
import { map, Observable } from 'rxjs';
import { getInitialsFromName } from '../../../../core/utils/get-initials.util';
import { pickRandomColor as pickAvatarColorStyle } from '../../../../core/utils/pick-random-color.util';

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
  readonly getInitials = getInitialsFromName;
  readonly pickRandomColor = (name: string) => pickAvatarColorStyle(name, '15px');

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
}
