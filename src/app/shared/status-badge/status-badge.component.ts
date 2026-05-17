import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type WorkItemStatus = 'Active' | 'Resolved' | 'Closed';

const STATUS_CLASSES: Record<WorkItemStatus, string> = {
  Active: 'badge-active',
  Resolved: 'badge-resolved',
  Closed: 'badge-closed',
};

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
  },
  template: `
    <span class="badge-dot" aria-hidden="true"></span>
    {{ status() }}
  `,
})
export class StatusBadgeComponent {
  readonly status = input.required<WorkItemStatus>();
  readonly hostClasses = computed(() => `badge ${STATUS_CLASSES[this.status()]}`);
}
