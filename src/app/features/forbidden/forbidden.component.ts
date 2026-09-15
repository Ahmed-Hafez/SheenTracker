import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forbidden.component.html',
  styleUrls: ['./forbidden.component.scss'],
})
export class ForbiddenComponent {
  constructor(private router: Router) {}

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
