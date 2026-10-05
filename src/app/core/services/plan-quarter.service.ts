import { computed, inject, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, finalize, map } from 'rxjs';
import { ApiService } from '../http/api_services/api.service';
import { PlanQuarter } from '../models/reponse/plan-quarter.response';
import { pickDefaultQuarter } from '../utils/plan-quarter';

/**
 * The Azure DevOps planning quarters and the one the Quarter Plans pages show.
 * The `quarter` query parameter is the source of truth, so a refresh or a shared link keeps it.
 */
@Injectable({
  providedIn: 'root',
})
export class PlanQuarterService {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  private readonly quartersEndpoint = 'dashboard/quarters';

  /** `null` until the list has loaded. */
  private readonly list = signal<PlanQuarter[] | null>(null);
  private isFetching = false;

  /** Last quarter shown this session, so links that drop the query string keep it. */
  private readonly lastShown = signal<string | null>(null);

  private readonly urlQuarter = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.readUrlQuarter()),
    ),
    { initialValue: this.readUrlQuarter() },
  );

  /** Ordered oldest first. Empty until loaded, or when Azure DevOps has none. */
  readonly quarters = computed(() => this.list() ?? []);

  /**
   * `undefined` while the list loads. `null` when there are no quarters, in which case
   * requests go out without `quarter`.
   */
  readonly selected = computed<PlanQuarter | null | undefined>(() => {
    const list = this.list();
    if (!list) return undefined;
    const byName = (name: string | null) =>
      name ? list.find((q) => q.name.toLowerCase() === name.toLowerCase()) : undefined;
    return byName(this.urlQuarter()) ?? byName(this.lastShown()) ?? pickDefaultQuarter(list);
  });

  /** Fetches the list once per session. Safe to call repeatedly. */
  load(): void {
    if (this.list() || this.isFetching) return;
    this.isFetching = true;
    this.apiService
      .get<PlanQuarter[]>(this.quartersEndpoint)
      .pipe(finalize(() => (this.isFetching = false)))
      .subscribe({
        next: (quarters) => this.list.set(quarters ?? []),
        // Without a list the pages still load, just without a quarter filter.
        error: () => this.list.set([]),
      });
  }

  select(name: string): void {
    this.lastShown.set(name);
    this.writeUrl(name, false);
  }

  /**
   * For a 404 (the backend doesn't know the quarter): go back to the default.
   * Returns false when the default is already selected, so callers don't retry forever.
   */
  resetToDefault(): boolean {
    const fallback = pickDefaultQuarter(this.quarters());
    this.lastShown.set(null);
    if (!fallback || fallback.name === this.selected()?.name) return false;
    this.writeUrl(fallback.name, true);
    return true;
  }

  /** Writes the selected quarter into the query string when it's missing or unknown there. */
  syncUrl(): void {
    const quarter = this.selected();
    if (!quarter) return;
    this.lastShown.set(quarter.name);
    if (this.urlQuarter() !== quarter.name) {
      this.writeUrl(quarter.name, true);
    }
  }

  private writeUrl(name: string, replaceUrl: boolean): void {
    // Empty commands keep the current path and only change the query string.
    void this.router.navigate([], {
      queryParams: { quarter: name },
      queryParamsHandling: 'merge',
      replaceUrl,
    });
  }

  private readUrlQuarter(): string | null {
    return this.router.routerState.snapshot.root.queryParamMap.get('quarter');
  }
}
