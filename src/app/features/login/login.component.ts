import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/http/backend_service/auth.service';
import { LoginRequest } from '../../core/models/request/login.request.model';
import { MessageService } from 'primeng/api';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-login',
  imports: [FormsModule, Message],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  email = signal('');
  password = signal('');
  showPassword = signal(false);
  isLoading = this.authService.isLoading;
  errorMessage = signal('');

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  onSubmit(): void {
    this.errorMessage.set('');

    if (!this.email() || !this.password()) {
      this.errorMessage.set('Please enter both email and password.');
      return;
    }

    const request: LoginRequest = {
      email: this.email(),
      password: this.password(),
    };

    this.authService.login(request).subscribe({
      next: (response) => {
        this.authService.handleLoginSuccess(response);
        if(response.roles.includes('Coordination')){
          this.router.navigate(['/users/system']);
        }else{
          this.router.navigate(['/dashboard']);
        }

      },
      error: () => {
        this.authService.isLoading.set(false);
        this.errorMessage.set('Invalid email or password.');
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: 'Invalid email or password. Please try again.',
          life: 5000,
        });
      },
    });
  }
}
