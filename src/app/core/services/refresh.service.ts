import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class RefreshService {
  private readonly refreshTickSignal = signal(0);
  readonly refreshTick = this.refreshTickSignal.asReadonly();

  private readonly lastRefreshedAtSignal = signal<Date | null>(null);
  /** When the user last asked for fresh data, shown in the topbar as confirmation. */
  readonly lastRefreshedAt = this.lastRefreshedAtSignal.asReadonly();

  trigger(): void {
    this.refreshTickSignal.update((value) => value + 1);
    this.lastRefreshedAtSignal.set(new Date());
  }
}
