import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../api_services/api.service';
import { ApiEnvelope, Setting, SettingValue } from '../../models/reponse/settings.response.model';
import { UpdateSettingRequest } from '../../models/request/update-setting.request.model';

/** App Settings (Super Admin only). There is no create or delete: the set of Settings is fixed in the database. */
@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly settingsEndpoint = 'settings';

  private readonly apiService = inject(ApiService);

  getAll(): Observable<Setting[]> {
    return this.apiService
      .get<ApiEnvelope<Setting[]>>(this.settingsEndpoint)
      .pipe(map((response) => response.data));
  }

  get(key: string): Observable<Setting> {
    return this.apiService
      .get<ApiEnvelope<Setting>>(this.urlFor(key))
      .pipe(map((response) => response.data));
  }

  /** Returns the Setting as stored, which may be normalized (trimmed, de-duplicated, canonical names). */
  update(key: string, value: SettingValue): Observable<Setting> {
    const body: UpdateSettingRequest = { value };
    return this.apiService
      .put<ApiEnvelope<Setting>>(this.urlFor(key), body)
      .pipe(map((response) => response.data));
  }

  private urlFor(key: string): string {
    return `${this.settingsEndpoint}/${encodeURIComponent(key)}`;
  }
}
