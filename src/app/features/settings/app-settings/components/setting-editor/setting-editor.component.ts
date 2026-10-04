import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime } from 'rxjs';
import {
  AbstractControl,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageModule } from 'primeng/message';

import { Setting, SettingValue } from '../../../../../core/models/reponse/settings.response.model';
import {
  countMatches,
  EnumOption,
  enumOptionsFor,
  labelForEnumName,
  MatchUser,
  SettingMeta,
  suggestUsers,
} from '../../setting-meta';

/** Saved entries shown before "Show all"; long enough to scan, short enough not to bury the page. */
const COLLAPSED_COUNT = 24;
/** A fragment matching this share of all users is almost certainly too broad. */
const BROAD_SHARE = 0.2;
/** Pause after the last keystroke before the user dropdown searches. */
const SUGGEST_DEBOUNCE_MS = 250;

export interface ListEntry {
  value: string;
  label: string;
  /** People this entry matches, or null when Azure users aren't loaded or the rule can't be checked. */
  matches: number | null;
}

/**
 * One Setting row: its label, help, typed editor, and Save/Cancel when edited.
 * List editors show unsaved additions and removals first, with what each one matches,
 * so an exclusion is never saved blind. The page performs the save.
 */
@Component({
  selector: 'app-setting-editor',
  imports: [
    ReactiveFormsModule,
    DatePipe,
    NgTemplateOutlet,
    InputNumberModule,
    MultiSelectModule,
    ToggleSwitchModule,
    MessageModule,
  ],
  templateUrl: './setting-editor.component.html',
  styleUrl: './setting-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingEditorComponent {
  private readonly injector = inject(Injector);

  readonly setting = input.required<Setting>();
  readonly meta = input.required<SettingMeta>();
  readonly saving = input(false);
  readonly serverError = input<string | null>(null);
  /** Azure DevOps users for match counts; null while loading or when unavailable. */
  readonly users = input<readonly MatchUser[] | null>(null);

  readonly save = output<SettingValue>();
  readonly dirtyChange = output<boolean>();

  readonly control = new FormControl<SettingValue | null>(null);

  private readonly current = signal<SettingValue | null>(null);
  private readonly valid = signal(true);
  private awaitingSave = false;

  private readonly title = viewChild<ElementRef<HTMLElement>>('title');
  private readonly entryInput = viewChild<ElementRef<HTMLInputElement>>('entryInput');

  readonly newEntry = signal('');
  readonly showAll = signal(false);
  readonly notice = signal<{ text: string; tone: 'info' | 'warn' } | null>(null);
  readonly savedNotice = signal(false);

  readonly controlId = computed(() => `setting-${this.setting().key.toLowerCase()}`);
  readonly isList = computed(() => this.setting().type.endsWith('List'));
  readonly isDirty = computed(() => !sameValue(this.current(), this.setting().value));
  readonly canSave = computed(() => this.isDirty() && this.valid() && !this.saving());

  // ── Lists ────────────────────────────────────────────────────────────

  private readonly savedItems = computed(() => asList(this.setting().value));
  private readonly currentItems = computed(() => asList(this.current()));

  readonly added = computed(() => this.toEntries(minus(this.currentItems(), this.savedItems())));
  readonly removed = computed(() => this.toEntries(minus(this.savedItems(), this.currentItems())));
  readonly changeCount = computed(() => this.added().length + this.removed().length);

  /** Saved entries still in the list, alphabetical, narrowed by what is typed in the field. */
  private readonly keptEntries = computed(() => {
    const kept = minus(
      this.savedItems(),
      this.removed().map((e) => e.value),
    );
    return this.toEntries(kept).sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: 'base' }),
    );
  });
  readonly keptCount = computed(() => this.keptEntries().length);
  readonly filterTerm = computed(() => this.newEntry().trim().toLowerCase());
  readonly matchingKept = computed(() => {
    const term = this.filterTerm();
    const kept = this.keptEntries();
    return term ? kept.filter((e) => e.label.toLowerCase().includes(term)) : kept;
  });
  readonly visibleKept = computed(() =>
    this.showAll() || this.filterTerm()
      ? this.matchingKept()
      : this.matchingKept().slice(0, COLLAPSED_COUNT),
  );
  readonly hiddenCount = computed(() => this.matchingKept().length - this.visibleKept().length);

  readonly canCheckMatches = computed(() => !!this.meta().match && this.users() !== null);
  /** "Added entries hide 3 people · removed entries free 1": the effect of saving, per this rule. */
  readonly effectSummary = computed(() => {
    if (!this.canCheckMatches()) return null;
    const sum = (entries: ListEntry[]) => entries.reduce((n, e) => n + (e.matches ?? 0), 0);
    const parts: string[] = [];
    if (this.added().length) parts.push(`added entries match ${people(sum(this.added()))}`);
    if (this.removed().length) parts.push(`removed entries match ${people(sum(this.removed()))}`);
    return parts.length ? capitalize(parts.join(' · ')) : null;
  });

  // ── User suggestions (name lists only) ───────────────────────────────

  private readonly debouncedTerm = toSignal(
    toObservable(this.filterTerm).pipe(debounceTime(SUGGEST_DEBOUNCE_MS)),
    { initialValue: '' },
  );
  readonly suggestionsOpen = signal(false);
  readonly activeIndex = signal(-1);
  readonly suggestions = computed<MatchUser[]>(() => {
    const users = this.users();
    const rule = this.meta().match;
    // Clearing the field must hide the dropdown now, not after the debounce.
    if (!users || !this.filterTerm() || (rule !== 'exactName' && rule !== 'nameContains')) return [];
    return suggestUsers(users, this.debouncedTerm(), this.currentItems());
  });
  readonly showSuggestions = computed(() => this.suggestionsOpen() && this.suggestions().length > 0);
  readonly activeId = computed(() =>
    this.showSuggestions() && this.activeIndex() >= 0
      ? `${this.controlId()}-option-${this.activeIndex()}`
      : null,
  );

  readonly isDuplicate = computed(() => {
    const term = this.filterTerm();
    return !!term && this.currentItems().some((item) => item.toLowerCase() === term);
  });
  readonly canAdd = computed(() => !!this.filterTerm() && !this.isDuplicate());

  /** Known options plus any stored name the app doesn't know, so a value is never silently dropped. */
  readonly enumOptions = computed<EnumOption[]>(() => {
    const known = enumOptionsFor(this.setting().type);
    const unknown = this.savedItems()
      .filter((name) => !known.some((o) => o.value.toLowerCase() === name.toLowerCase()))
      .map((name) => ({ label: name, value: name }));
    return [...known, ...unknown];
  });
  readonly enumCoverage = computed(() => {
    if (!this.canCheckMatches()) return null;
    const total = this.currentItems().reduce(
      (n, item) => n + countMatches(this.meta().match!, item, this.users()!),
      0,
    );
    return `Selected ${this.currentItems().length === 1 ? 'department matches' : 'departments match'} ${people(total)}`;
  });

  // ── Numbers ──────────────────────────────────────────────────────────

  readonly validationMessage = computed(() => {
    this.current();
    if (!this.isDirty() || this.valid()) return null;
    const errors = this.control.errors ?? {};
    if (errors['required']) return 'Enter a value.';
    const { min, max, maxFractionDigits } = this.meta();
    if (min !== undefined && max !== undefined) {
      return `Enter a number from ${min} to ${max}${
        maxFractionDigits ? ` with up to ${maxFractionDigits} decimals` : ''
      }.`;
    }
    return 'Enter a valid value.';
  });
  readonly softWarning = computed(() => {
    const value = this.current();
    const softMax = this.meta().softMax;
    if (!this.isDirty() || !this.valid() || softMax === undefined || typeof value !== 'number') {
      return null;
    }
    return value > softMax
      ? `${value} is more than a typical working day. Check it before saving.`
      : null;
  });

  constructor() {
    this.control.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.current.set(value);
      this.valid.set(this.control.valid);
      this.savedNotice.set(false);
    });

    // A new Setting object (first load or the server's response to a save) becomes the saved baseline.
    effect(() => {
      const setting = this.setting();
      const meta = this.meta();
      untracked(() => {
        this.control.setValidators(validatorsFor(setting, meta));
        this.control.reset(cloneValue(setting.value));
        this.newEntry.set('');
        this.notice.set(null);
        if (this.awaitingSave) {
          this.awaitingSave = false;
          this.savedNotice.set(true);
          // The Save button just unmounted; keep keyboard users in this row.
          afterNextRender(() => this.title()?.nativeElement.focus(), { injector: this.injector });
        }
      });
    });

    effect(() => {
      if (this.serverError()) this.awaitingSave = false;
    });

    effect(() => this.dirtyChange.emit(this.isDirty()));

    effect(() => {
      this.suggestions();
      untracked(() => this.activeIndex.set(-1));
    });
  }

  /** p-inputnumber only commits its value on blur; mirror each keystroke so Save appears while typing. */
  onNumberInput(value: number | string | null | undefined): void {
    const parsed = typeof value === 'string' ? Number(value) : value;
    this.control.setValue(parsed ?? null, { emitModelToViewChange: false });
  }

  addEntry(): void {
    this.addEntries([this.newEntry()]);
  }

  /** Pasting a comma- or line-separated list adds every entry at once. */
  onPaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text') ?? '';
    if (!/[\n,;]/.test(text)) return;
    event.preventDefault();
    this.addEntries(text.split(/[\n,;]+/));
  }

  onEntryInput(value: string): void {
    this.newEntry.set(value);
    this.suggestionsOpen.set(true);
  }

  pickSuggestion(user: MatchUser): void {
    this.addEntries([user.displayName]);
    this.suggestionsOpen.set(false);
  }

  onEntryKeydown(event: KeyboardEvent): void {
    const count = this.suggestions().length;
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && count) {
      event.preventDefault();
      this.suggestionsOpen.set(true);
      const down = event.key === 'ArrowDown';
      this.activeIndex.update((i) => (i < 0 ? (down ? 0 : count - 1) : (i + (down ? 1 : -1) + count) % count));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const active = this.showSuggestions() ? this.suggestions()[this.activeIndex()] : undefined;
      if (active) this.pickSuggestion(active);
      else this.addEntry();
    } else if (event.key === 'Escape' && this.showSuggestions()) {
      event.preventDefault();
      this.suggestionsOpen.set(false);
    } else if (event.key === 'Escape' && this.newEntry()) {
      event.preventDefault();
      this.newEntry.set('');
    }
  }

  removeEntry(entry: string): void {
    this.control.setValue(this.currentItems().filter((item) => item !== entry));
    this.notice.set({
      text: `Removed "${entry}". Save to apply, or restore it above.`,
      tone: 'info',
    });
    this.entryInput()?.nativeElement.focus();
  }

  /** Undo an unsaved addition or removal. */
  revert(entry: string): void {
    const wasSaved = this.savedItems().includes(entry);
    this.control.setValue(
      wasSaved
        ? [...this.currentItems(), entry]
        : this.currentItems().filter((item) => item !== entry),
    );
    this.notice.set({
      text: wasSaved
        ? `Restored "${this.labelFor(entry)}".`
        : `Took back "${this.labelFor(entry)}".`,
      tone: 'info',
    });
    this.entryInput()?.nativeElement.focus();
  }

  cancel(): void {
    this.control.reset(cloneValue(this.setting().value));
    this.newEntry.set('');
    this.notice.set(null);
  }

  submit(): void {
    const value = this.current();
    if (!this.canSave() || value === null) return;
    this.awaitingSave = true;
    // Keep saved entries in their stored order and append additions, so the server diff stays small.
    this.save.emit(
      Array.isArray(value)
        ? [
            ...minus(
              this.savedItems(),
              this.removed().map((e) => e.value),
            ),
            ...this.added().map((e) => e.value),
          ]
        : value,
    );
  }

  private addEntries(raw: string[]): void {
    const existing = new Set(this.currentItems().map((item) => item.toLowerCase()));
    const fresh: string[] = [];
    let duplicates = 0;
    for (const candidate of raw.map((r) => r.trim()).filter(Boolean)) {
      if (existing.has(candidate.toLowerCase())) {
        duplicates++;
        continue;
      }
      existing.add(candidate.toLowerCase());
      fresh.push(candidate);
    }
    if (fresh.length) this.control.setValue([...this.currentItems(), ...fresh]);
    this.newEntry.set('');
    this.notice.set(addNotice(fresh, duplicates));
  }

  private toEntries(values: string[]): ListEntry[] {
    const rule = this.meta().match;
    const users = this.users();
    return values.map((value) => ({
      value,
      label: this.labelFor(value),
      matches: rule && users ? countMatches(rule, value, users) : null,
    }));
  }

  private labelFor(value: string): string {
    return labelForEnumName(this.setting().type, value);
  }

  /** True when a fragment hides a large share of everyone. */
  isBroad(entry: ListEntry): boolean {
    const users = this.users();
    return (
      this.meta().match === 'nameContains' &&
      !!users?.length &&
      (entry.matches ?? 0) >= Math.max(5, users.length * BROAD_SHARE)
    );
  }
}

function addNotice(
  fresh: string[],
  duplicates: number,
): { text: string; tone: 'info' | 'warn' } | null {
  if (!fresh.length && duplicates) {
    return {
      text:
        duplicates === 1 ? 'Already in the list.' : `All ${duplicates} are already in the list.`,
      tone: 'warn',
    };
  }
  if (!fresh.length) return null;
  const added = fresh.length === 1 ? `Added "${fresh[0]}".` : `Added ${fresh.length} entries.`;
  const skipped = duplicates ? ` ${duplicates} already in the list.` : '';
  return { text: `${added}${skipped} Save to apply.`, tone: duplicates ? 'warn' : 'info' };
}

function validatorsFor(setting: Setting, meta: SettingMeta): ValidatorFn[] {
  if (setting.type !== 'Int' && setting.type !== 'Decimal') return [];
  const validators = [Validators.required];
  if (meta.min !== undefined) validators.push(Validators.min(meta.min));
  if (meta.max !== undefined) validators.push(Validators.max(meta.max));
  const digits = setting.type === 'Int' ? 0 : meta.maxFractionDigits;
  if (digits !== undefined) validators.push(maxFractionDigits(digits));
  return validators;
}

function maxFractionDigits(digits: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (typeof value !== 'number') return null;
    const scaled = value * 10 ** digits;
    return Math.abs(scaled - Math.round(scaled)) < 1e-9 ? null : { fractionDigits: digits };
  };
}

function asList(value: SettingValue | null): string[] {
  return Array.isArray(value) ? value : [];
}

/** Items of `a` not in `b`, compared case-insensitively. */
function minus(a: readonly string[], b: readonly string[]): string[] {
  const exclude = new Set(b.map((item) => item.toLowerCase()));
  return a.filter((item) => !exclude.has(item.toLowerCase()));
}

function cloneValue(value: SettingValue): SettingValue {
  return Array.isArray(value) ? [...value] : value;
}

/** Lists compare as sets: removing and restoring an entry is not a change. */
function sameValue(a: SettingValue | null, b: SettingValue): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    const norm = (list: string[]) =>
      [...list]
        .map((s) => s.toLowerCase())
        .sort()
        .join('\u0000');
    return norm(a) === norm(b);
  }
  return a === b;
}

function people(n: number): string {
  return `${n} ${n === 1 ? 'person' : 'people'}`;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
