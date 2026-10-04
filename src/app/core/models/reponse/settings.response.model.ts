/** The kind of value a Setting holds. The backend sends it as a name, never a number. */
export type SettingType =
  'String' | 'Int' | 'Decimal' | 'Bool' | 'StringList' | 'DepartmentList' | 'SeniorityList';

/** Typed JSON value: a number for Int/Decimal, a boolean for Bool, a string array for the list types. */
export type SettingValue = string | number | boolean | string[];

/** A business value a Super Admin can change while the system runs (`/api/settings`). */
export interface Setting {
  key: string;
  value: SettingValue;
  type: SettingType;
  description: string | null;
  /** ISO 8601 with offset. */
  updatedAt: string;
}

/** The `ApiResponse<T>` envelope the backend wraps every response in. */
export interface ApiEnvelope<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  errors: string[] | null;
}
