import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { SettingsService } from './settings.service';
import { Setting } from '../../models/reponse/settings.response.model';
import { environment } from '../../../../environments/environment';

const setting: Setting = {
  key: 'DefaultExpectedHours',
  value: 8,
  type: 'Decimal',
  description: null,
  updatedAt: '2026-09-30T12:00:00+00:00',
};

const envelope = <T>(data: T) => ({
  success: true,
  statusCode: 200,
  message: 'ok',
  data,
  errors: null,
});

describe('SettingsService', () => {
  let service: SettingsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SettingsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getAll GETs settings and unwraps data', () => {
    let result: Setting[] | undefined;
    service.getAll().subscribe((r) => (result = r));

    const req = http.expectOne(`${environment.apiUrl}settings`);
    expect(req.request.method).toBe('GET');
    req.flush(envelope([setting]));

    expect(result).toEqual([setting]);
  });

  it('update PUTs { value } to the encoded key and returns the stored Setting', () => {
    let result: Setting | undefined;
    service.update('Default Expected Hours', 7.5).subscribe((r) => (result = r));

    const req = http.expectOne(`${environment.apiUrl}settings/Default%20Expected%20Hours`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ value: 7.5 });
    req.flush(envelope({ ...setting, value: 7.5 }));

    expect(result?.value).toBe(7.5);
  });
});
