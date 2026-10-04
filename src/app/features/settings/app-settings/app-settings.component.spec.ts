import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AppSettingsComponent } from './app-settings.component';
import { SettingsService } from '../../../core/http/backend_service/settings.service';
import { UsersService } from '../../../core/http/backend_service/azure-users.service';
import { Setting, SettingValue } from '../../../core/models/reponse/settings.response.model';

const hours: Setting = {
  key: 'DefaultExpectedHours',
  value: 8,
  type: 'Decimal',
  description: null,
  updatedAt: '2026-09-30T12:00:00+00:00',
};
const names: Setting = {
  key: 'ExcludedDisplayNames',
  value: ['Build Bot'],
  type: 'StringList',
  description: null,
  updatedAt: '2026-09-30T12:00:00+00:00',
};

describe('AppSettingsComponent', () => {
  let getAll$: Subject<Setting[]>;
  let update$: Subject<Setting>;
  let updateSpy: ReturnType<typeof vi.fn>;

  function setup() {
    getAll$ = new Subject<Setting[]>();
    update$ = new Subject<Setting>();
    updateSpy = vi.fn((_key: string, _value: SettingValue) => update$);
    TestBed.configureTestingModule({
      imports: [AppSettingsComponent],
      providers: [
        MessageService,
        { provide: UsersService, useValue: { getAzureUsers: () => of({ users: [] }) } },
        { provide: SettingsService, useValue: { getAll: () => getAll$, update: updateSpy } },
      ],
    });
    const fixture = TestBed.createComponent(AppSettingsComponent);
    fixture.detectChanges();
    return fixture;
  }

  const text = (el: HTMLElement) => el.textContent?.replace(/\s+/g, ' ') ?? '';

  it('renders Settings grouped once loaded', () => {
    const fixture = setup();
    getAll$.next([names, hours]);
    fixture.detectChanges();

    const titles = [...fixture.nativeElement.querySelectorAll('.settings-group__title')].map(
      (el: HTMLElement) => el.textContent?.trim(),
    );
    expect(titles).toEqual(['Hours summary exclusions', 'New System Users']);
    expect(text(fixture.nativeElement)).toContain('Build Bot');
  });

  it('shows the server message and Try again when loading fails', () => {
    const fixture = setup();
    getAll$.error(
      new HttpErrorResponse({
        status: 500,
        error: { message: 'Internal server error', errors: ["Setting 'X': bad value."] },
      }),
    );
    fixture.detectChanges();

    expect(text(fixture.nativeElement)).toContain("Setting 'X': bad value.");
    expect(text(fixture.nativeElement)).toContain('Try again');
  });

  it('replaces the Setting with the server response after a save', () => {
    const fixture = setup();
    const component = fixture.componentInstance;
    getAll$.next([names]);

    component.onSave(names, ['Build Bot', '  build bot '], 'Excluded display names');
    expect(updateSpy).toHaveBeenCalledWith('ExcludedDisplayNames', ['Build Bot', '  build bot ']);
    expect(component.isSaving(names)).toBe(true);

    const stored = { ...names, value: ['Build Bot'], updatedAt: '2026-10-03T10:00:00+00:00' };
    update$.next(stored);

    expect(component.settings()).toEqual([stored]);
    expect(component.isSaving(stored)).toBe(false);
  });

  it('keeps the server message next to the Setting on a 400', () => {
    const fixture = setup();
    const component = fixture.componentInstance;
    getAll$.next([hours]);

    component.onSave(hours, 65, 'Default Expected Hours');
    update$.error(
      new HttpErrorResponse({
        status: 400,
        error: { message: "Setting 'DefaultExpectedHours': must be between 0 and 24." },
      }),
    );
    fixture.detectChanges();

    expect(component.errorFor(hours)).toContain('between 0 and 24');
    expect(component.settings()).toEqual([hours]);
  });

  it('reports unsaved changes while an editor is dirty', () => {
    const fixture = setup();
    const component = fixture.componentInstance;
    getAll$.next([hours]);

    component.onDirtyChange(hours, true);
    expect(component.hasUnsavedChanges()).toBe(true);
    component.onDirtyChange(hours, false);
    expect(component.hasUnsavedChanges()).toBe(false);
  });
});
