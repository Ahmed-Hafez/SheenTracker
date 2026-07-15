import { Component, effect, inject, OnInit, signal, untracked } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MetaDataService } from './core/http/backend_service/meta-data.service';
import { AuthService } from './core/http/backend_service/auth.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.component.html',
})
export class App {
  private readonly metaDataService = inject(MetaDataService);
  private readonly authService = inject(AuthService);
  messageService = inject(MessageService);


  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.initialize();
      }
    });
  }
  initialize(){
    untracked(() => {
    this.getMetaData();
      const isCoordination = this.authService.getUserData()?.roles.includes('Coordination');
      if(isCoordination){
        this.getSquads();
      }
    });
  }

  getMetaData() {
    this.metaDataService.isUsersLoading.set(true);
    console.log('is loading', this.metaDataService.isUsersLoading());
    this.metaDataService.getAzureUsersMetaData().subscribe({
      next: (users) => {
        this.metaDataService.isUsersLoading.set(false);
        console.log('Fetched', users, 'is loading', this.metaDataService.isUsersLoading());
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error fetching Azure users',
        });
        this.metaDataService.isUsersLoading.set(false);
      },
    });
  }

  getSquads() {
    this.metaDataService.isSquadsLoading.set(true);
    this.metaDataService.getSquads().subscribe({
      next: (squads) => {
        this.metaDataService.isSquadsLoading.set(false);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error fetching squads',
        });
        this.metaDataService.isSquadsLoading.set(false);
      },
    });
  }
}
