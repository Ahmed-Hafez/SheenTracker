import { Component, computed, input, output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';

type AzureStatus = 'idle' | 'searching' | 'found' | 'not_found';


@Component({
  selector: 'app-azure-status',
  imports: [ButtonModule],
  templateUrl: './azure-status.component.html',
  styleUrl: './azure-status.component.scss',
})
export class AzureStatusComponent {
  status = input.required<AzureStatus>();
  email = input.required<string>();
  match = input<string | null>(null);

  connect = output<void>();

  isSearching = computed(() => this.status() === 'searching');
  isFound = computed(() => this.status() === 'found');
  isNotFound = computed(() => this.status() === 'not_found');
}
