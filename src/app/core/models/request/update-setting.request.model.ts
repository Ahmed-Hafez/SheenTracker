import { SettingValue } from '../reponse/settings.response.model';

/** Body of `PUT /api/settings/{key}`: the same typed value a read returns. */
export interface UpdateSettingRequest {
  value: SettingValue;
}
