import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

import { SettingsService } from '../../../core/http/backend_service/settings.service';
import { UsersService } from '../../../core/http/backend_service/azure-users.service';
import { Department } from '../../../core/enums/departments.enum';
import { RefreshService } from '../../../core/services/refresh.service';
import { HasUnsavedChanges } from '../../../core/guards/unsaved-changes.guard';
import { Setting, SettingValue } from '../../../core/models/reponse/settings.response.model';
import { SettingEditorComponent } from './components/setting-editor/setting-editor.component';
import {
  GROUP_DESCRIPTIONS,
  GROUP_ORDER,
  GROUP_TITLES,
  MatchUser,
  metaFor,
  SettingGroup,
  SettingMeta,
} from './setting-meta';

interface SettingGroupView {
  id: SettingGroup;
  title: string;
  description: string;
  items: { setting: Setting; meta: SettingMeta }[];
}

/** Super Admin page for the runtime-editable business values behind `/api/settings`. */
@Component({
  selector: 'app-app-settings',
  imports: [SettingEditorComponent, ConfirmDialogModule],
  providers: [ConfirmationService],
  templateUrl: './app-settings.component.html',
  styleUrl: './app-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:beforeunload)': 'onBeforeUnload($event)',
  },
})
export class AppSettingsComponent implements HasUnsavedChanges {
  private readonly settingsService = inject(SettingsService);
  private readonly refreshService = inject(RefreshService);
  private readonly messageService = inject(MessageService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly usersService = inject(UsersService);

  /** Azure DevOps users, used only to show how many people each exclusion matches. Null until loaded. */
  readonly matchUsers = signal<readonly MatchUser[] | null>(null);

  readonly settings = signal<Setting[]>([]);
  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);

  /** Keyed by lowercased Setting key. */
  readonly savingKeys = signal<ReadonlySet<string>>(new Set());
  readonly errors = signal<Readonly<Record<string, string>>>({});
  private readonly dirtyKeys = signal<ReadonlySet<string>>(new Set());

  readonly groups = computed<SettingGroupView[]>(() => {
    const items = this.settings().map((setting) => ({ setting, meta: metaFor(setting) }));
    return GROUP_ORDER.map((id) => ({
      id,
      title: GROUP_TITLES[id],
      description: GROUP_DESCRIPTIONS[id],
      items: items.filter((item) => item.meta.group === id),
    })).filter((group) => group.items.length > 0);
  });

  constructor() {
    effect(() => {
      this.refreshService.refreshTick();
      untracked(() => this.loadSettings());
    });
  }

  loadSettings(): void {
    this.loadMatchUsers();
    this.isLoading.set(true);
    this.loadError.set(null);
    this.settingsService.getAll().subscribe({
      next: (settings) => {
        this.isLoading.set(false);
        // A refresh must not throw away edits in progress: keep the baseline of dirty Settings.
        const dirty = this.dirtyKeys();
        const previous = new Map(this.settings().map((s) => [s.key.toLowerCase(), s]));
        this.settings.set(
          settings.map((s) => {
            const key = s.key.toLowerCase();
            return dirty.has(key) ? (previous.get(key) ?? s) : s;
          }),
        );
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.loadError.set(errorMessage(err) ?? "The server didn't return the settings.");
      },
    });
  }

  /** Match counts are a hint: if the users can't be loaded, the lists still work, just without counts. */
  private loadMatchUsers(): void {
    this.usersService.getAzureUsers().subscribe({
      next: ({ users }) =>
        this.matchUsers.set(
          users.map((u) => ({
            displayName: u.displayName,
            department: Department[u.department] ?? null,
          })),
        ),
      error: () => this.matchUsers.set(null),
    });
  }

  onSave(setting: Setting, value: SettingValue, label: string): void {
    const key = setting.key.toLowerCase();
    this.savingKeys.update((keys) => new Set(keys).add(key));
    this.setError(key, null);

    this.settingsService.update(setting.key, value).subscribe({
      next: (saved) => {
        this.endSaving(key);
        // The server may normalize the value; always show what it stored.
        this.settings.update((list) => list.map((s) => (s.key.toLowerCase() === key ? saved : s)));
        this.messageService.add({
          severity: 'success',
          summary: 'Setting saved',
          detail: `${label} updated.`,
        });
      },
      error: (err: HttpErrorResponse) => {
        this.endSaving(key);
        if (err.status === 404) {
          this.setError(key, 'This setting no longer exists.');
          this.loadSettings();
          return;
        }
        this.setError(key, errorMessage(err) ?? "Couldn't save this setting. Try again.");
      },
    });
  }

  onDirtyChange(setting: Setting, dirty: boolean): void {
    const key = setting.key.toLowerCase();
    this.dirtyKeys.update((keys) => {
      const next = new Set(keys);
      if (dirty) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }

  isSaving(setting: Setting): boolean {
    return this.savingKeys().has(setting.key.toLowerCase());
  }

  errorFor(setting: Setting): string | null {
    return this.errors()[setting.key.toLowerCase()] ?? null;
  }

  hasUnsavedChanges(): boolean {
    return this.dirtyKeys().size > 0;
  }

  confirmDiscard(): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmationService.confirm({
        header: 'Discard unsaved changes?',
        message: 'Your edits to these settings have not been saved.',
        acceptLabel: 'Discard',
        rejectLabel: 'Keep editing',
        acceptButtonProps: { severity: 'danger' },
        rejectButtonProps: { severity: 'secondary', outlined: true },
        defaultFocus: 'reject',
        accept: () => resolve(true),
        reject: () => resolve(false),
      });
    });
  }

  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      event.preventDefault();
    }
  }

  private endSaving(key: string): void {
    this.savingKeys.update((keys) => {
      const next = new Set(keys);
      next.delete(key);
      return next;
    });
  }

  private setError(key: string, message: string | null): void {
    this.errors.update((errors) => {
      const next = { ...errors };
      if (message) {
        next[key] = message;
      } else {
        delete next[key];
      }
      return next;
    });
  }
}

/** The backend's `ApiResponse` puts the useful text in `errors` (500) or `message` (400/404). */
function errorMessage(err: HttpErrorResponse): string | null {
  const body = err.error as { message?: string; errors?: string[] | null } | null;
  return body?.errors?.[0] ?? body?.message ?? null;
}
