import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { MenuItem } from 'primeng/api';

// Shared
import { StatCardComponent } from '../../shared/stat-card/stat-card.component';

// Models & Mock
import {
  ALL_EPICS_MOCK,
  ALL_EPICS_SUMMARY,
  Epic,
  EpicStatus,
} from '../../core/mock/all-epics.mock';

type FilterKey = 'On Track' | 'At Risk' | 'Off Track' | 'Has Remaining' | 'Not Started' | 'Completed';

@Component({
  selector: 'app-quarter-plans-all-epics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BreadcrumbModule,
    InputTextModule,
    ButtonModule,
    SkeletonModule,
    IconFieldModule,
    InputIconModule,
    TableModule,
    TagModule,
    StatCardComponent,
  ],
  templateUrl: './quarter-plans-all-epics.component.html',
  styleUrl: './quarter-plans-all-epics.component.scss',
})
export class QuarterPlansAllEpicsComponent implements OnInit {

  // ── Breadcrumb ─────────────────────────────────────────────────────────────
  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Quarter Plans', routerLink: '/quarter-plans' },
    { label: 'All Epics' },
  ];

  // ── Loading ────────────────────────────────────────────────────────────────
  isLoading = signal(true);

  // ── Data ──────────────────────────────────────────────────────────────────
  readonly allEpics = ALL_EPICS_MOCK;
  readonly summary = ALL_EPICS_SUMMARY;

  // ── p-table row expansion (keyed by epic id) ──────────────────────────────
  expandedRows: { [key: string]: boolean } = {};

  // ── Search ────────────────────────────────────────────────────────────────
  searchQuery = signal('');

  // ── Filters (multi-select toggles) ────────────────────────────────────────
  readonly filterOptions: FilterKey[] = [
    'On Track', 'At Risk', 'Off Track', 'Has Remaining', 'Not Started', 'Completed',
  ];
  activeFilters = signal<Set<FilterKey>>(new Set());

  // ── Derived: filtered list ─────────────────────────────────────────────────
  filteredEpics = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const filters = this.activeFilters();

    return this.allEpics.filter((epic) => {
      if (!epic.title.toLowerCase().includes(query)) {
        return false;
      }
      if (filters.size > 0) {
        const match =
          (filters.has('On Track')      && epic.status === 'On Track')  ||
          (filters.has('At Risk')        && epic.status === 'At Risk')   ||
          (filters.has('Off Track')      && epic.status === 'Off Track') ||
          (filters.has('Has Remaining')  && epic.remaining > 0)          ||
          (filters.has('Not Started')    && epic.completed === 0)        ||
          (filters.has('Completed')      && epic.remaining === 0);
        if (!match) return false;
      }
      return true;
    });
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    setTimeout(() => this.isLoading.set(false), 4000);
  }

  // ── Filter toggle ──────────────────────────────────────────────────────────
  toggleFilter(filter: FilterKey): void {
    this.activeFilters.update((current) => {
      const next = new Set(current);
      next.has(filter) ? next.delete(filter) : next.add(filter);
      return next;
    });
  }

  isFilterActive(filter: FilterKey): boolean {
    return this.activeFilters().has(filter);
  }

  // ── Expand / Collapse All ─────────────────────────────────────────────────
  expandAll(): void {
    this.expandedRows = this.filteredEpics().reduce(
      (acc, epic) => ({ ...acc, [epic.id]: true }),
      {}
    );
  }

  collapseAll(): void {
    this.expandedRows = {};
  }

  // ── Row expand handlers ───────────────────────────────────────────────────
  onRowExpand(event: any): void {
    // PrimeNG handles the object update internally when dataKey is set,
    // but the events are emitted to let us know. No extra work needed here unless tracking.
  }

  onRowCollapse(event: any): void {
  }

  // ── Status helpers ────────────────────────────────────────────────────────
  statusSeverity(status: EpicStatus): 'success' | 'warn' | 'danger' {
    switch (status) {
      case 'On Track':  return 'success';
      case 'At Risk':   return 'warn';
      case 'Off Track': return 'danger';
    }
  }

  trackByEpicId(_: number, epic: Epic): string { return epic.id; }
}
