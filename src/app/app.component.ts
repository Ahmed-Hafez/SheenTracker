import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MetaDataService } from './core/http/backend_service/meta-data.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.component.html',
})
export class App implements OnInit {
  private readonly metaDataService = inject(MetaDataService);
  messageService = inject(MessageService);

  ngOnInit(): void {
    this.getMetaData();
  }

  getMetaData() {
    this.metaDataService.isLoading.set(true);
    console.log('is loading', this.metaDataService.isLoading());
    this.metaDataService.getAzureUsers().subscribe({
      next: (users) => {
        this.metaDataService.isLoading.set(false);
        console.log('Fetched', users, 'is loading', this.metaDataService.isLoading());
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error fetching Azure users',
        });
        this.metaDataService.isLoading.set(false);
      },
    });
  }
}
