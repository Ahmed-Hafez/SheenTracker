import { Component, signal, computed, inject, Injector } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, map, startWith, Subject, switchMap, tap } from 'rxjs';
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
import { MenuItem, TreeNode } from 'primeng/api';
import { TreeTableModule, TreeTablePaginatorState } from 'primeng/treetable';
import { BacklogItemUIModel } from './backlog-tree-node.model';
// Shared
import { StatCardComponent } from '../../../shared/stat-card/stat-card.component';

// Models & Mock
import { ALL_EPICS_SUMMARY } from '../../../core/mock/all-epics.mock';
import {
  BacklogItemApiModel,
  AllEpicsResponse,
} from '../../../core/models/reponse/backlog-response.model';
import { MultiSelect } from 'primeng/multiselect';
import {
  EPICS_PAGE_SIZE,
  isUnknownQuarter,
  QuarterPlansService,
  selectedQuarterChanges,
} from '../../../core/http/backend_service/quarter-plans.service';
import { PlanQuarterService } from '../../../core/services/plan-quarter.service';

type FilterKey =
  'On Track' | 'At Risk' | 'Off Track' | 'Has Remaining' | 'Not Started' | 'Completed';

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
    TreeTableModule,
    FormsModule,
  ],
  templateUrl: './quarter-plans-all-epics.component.html',
  styleUrl: './quarter-plans-all-epics.component.scss',
})
export class QuarterPlansAllEpicsComponent {
  private readonly epicsService = inject(QuarterPlansService);
  private readonly planQuarterService = inject(PlanQuarterService);
  // ── Breadcrumb ─────────────────────────────────────────────────────────────
  readonly breadcrumbHome: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Quarter Plans', routerLink: '/quarter-plans', queryParamsHandling: 'preserve' },
    { label: 'All Epics' },
  ];

  // ── Loading ────────────────────────────────────────────────────────────────
  isLoading = signal(true);

  // ── Data ──────────────────────────────────────────────────────────────────
  backlogResponse = signal<AllEpicsResponse | null>(null);
  BacklogTreeNodes = signal<TreeNode<BacklogItemUIModel>[]>([]);

  readonly summary = ALL_EPICS_SUMMARY;

  readonly pageSize = EPICS_PAGE_SIZE;
  first = signal(0);
  isError = signal(false);

  private readonly pageRequests = new Subject<number>();

  searchQuery = signal('');

  constructor() {
    this.planQuarterService.load();
    selectedQuarterChanges(this.planQuarterService, inject(Injector))
      .pipe(
        // A new quarter starts again from page 1 and drops the old quarter's tree.
        switchMap((quarter) => {
          this.first.set(0);
          this.backlogResponse.set(null);
          this.BacklogTreeNodes.set([]);
          return this.pageRequests.pipe(
            startWith(1),
            map((pageNumber) => ({ quarter, pageNumber })),
          );
        }),
        tap(() => {
          this.isLoading.set(true);
          this.isError.set(false);
        }),
        // Switching unsubscribes from the previous request, so a late response is never shown.
        switchMap(({ quarter, pageNumber }) =>
          this.epicsService.getAllEpics(pageNumber, quarter?.name ?? null).pipe(
            catchError((error: unknown) => {
              if (!(isUnknownQuarter(error, quarter) && this.planQuarterService.resetToDefault())) {
                this.isLoading.set(false);
                this.isError.set(true);
              }
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((response) => {
        this.backlogResponse.set(response);
        this.initializeTreeNodes();
        this.isLoading.set(false);
      });
  }

  onPage(event: TreeTablePaginatorState): void {
    const first = event.first ?? 0;
    this.first.set(first);
    this.pageRequests.next(first / (event.rows ?? this.pageSize) + 1);
  }

  initializeTreeNodes(): void {
    const firstLevelInTree = 0;
    const response = this.backlogResponse();
    if (response) {
      this.BacklogTreeNodes.set(
        response.items.map((backlogApiItem) =>
          this.createTreeNode(backlogApiItem, firstLevelInTree),
        ),
      );
    }
  }

  private createTreeNode(
    backlogApiItem: BacklogItemApiModel,
    levelNumber: number,
  ): TreeNode<BacklogItemUIModel> {
    //ceil all numbers
    backlogApiItem.effort = Math.ceil(backlogApiItem.effort);
    backlogApiItem.completedWork = Math.ceil(backlogApiItem.completedWork);
    backlogApiItem.remainingWork = Math.ceil(backlogApiItem.effort - backlogApiItem.completedWork);
    const uiModel: BacklogItemUIModel = {
      data: backlogApiItem,
      color: this.getLevelColor(levelNumber),
      levelNumber: levelNumber,
      icon: this.getLevelIcon(levelNumber),
    };
    return {
      data: uiModel,
      children: uiModel.data.children?.map((child) => this.createTreeNode(child, levelNumber + 1)),
    };
  }

  private getLevelColor(levelNumber: number): string {
    switch (levelNumber) {
      case 0:
        return '#A855F7'; // Purple
      case 1:
        return '#6366F1'; // Indigo
      case 2:
        return '#06B6D4'; // Cyan
      case 3:
        return '#EAB308'; // Yellow
      default:
        return '#A90000'; // Default color for levels beyond 3
    }
  }

  private getLevelIcon(levelNumber: number): string {
    switch (levelNumber) {
      case 0:
        return 'pi pi-crown';
      case 1:
        return 'pi pi-star';
      case 2:
        return 'pi pi-book';
      case 3:
        return 'pi pi-code';
      default:
        return ''; // Default icon for levels beyond 3
    }
  }

  expandAll(): void {
    this.BacklogTreeNodes.update((nodes) => {
      this.setExpandedRecursively(nodes, true);
      return [...nodes];
    });
  }

  collapseAll(): void {
    this.BacklogTreeNodes.update((nodes) => {
      this.setExpandedRecursively(nodes, false);
      return [...nodes];
    });
  }

  private setExpandedRecursively(nodes: TreeNode<BacklogItemUIModel>[], expanded: boolean): void {
    for (const node of nodes) {
      node.expanded = expanded;

      if (node.children?.length) {
        this.setExpandedRecursively(node.children, expanded);
      }
    }
  }

  getSeverity(healthStatus: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (healthStatus) {
      case 'On Track':
        return 'success';
      case 'At Risk':
        return 'warn';
      case 'Off Track':
        return 'danger';
      default:
        return 'info';
    }
  }

  readonly filterOptions: FilterKey[] = [
    'On Track',
    'At Risk',
    'Off Track',
    'Has Remaining',
    'Not Started',
    'Completed',
  ];

  activeFilters = signal<Set<FilterKey>>(new Set());

  // Array view for the multiselect (it binds to arrays, not Sets)
  selectedFiltersArray = computed(() => Array.from(this.activeFilters()));

  onFiltersChange(values: FilterKey[]) {
    this.activeFilters.set(new Set(values));
  }
}
