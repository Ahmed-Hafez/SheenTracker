import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RefreshService {
  private readonly refreshTickSignal = signal(0);
  readonly refreshTick = this.refreshTickSignal.asReadonly();

  trigger(): void {
    this.refreshTickSignal.update((value) => value + 1);
  }
}
