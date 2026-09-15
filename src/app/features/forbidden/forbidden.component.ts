import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/http/backend_service/auth.service';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forbidden.component.html',
  styleUrls: ['./forbidden.component.scss'],
})
export class ForbiddenComponent {
  constructor(private router: Router) {}

  private readonly authService = inject(AuthService);
  userData = this.authService.getUserData();


  navigateToHome(): void {
    const mainPage = this.authService.getMainPageBasedOnUserRole();
    this.router.navigate([mainPage]);
  }
}
