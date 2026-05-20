import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { DateService } from '../../services/date.service';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private readonly headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json',
    'Client-Id': 'NDC-Core',
    'x-api-key': 'ttdb2dc2-58c5-481c-84b5-95350a3a7978-f61360c2-f536-4b19-9a25-97b8f17ce4dc',
    'X-FileName': 'appsettings.Development.json',
  });

  private readonly httpClient = inject(HttpClient);
  private readonly dateService = inject(DateService);

  private selectedDateRange = this.dateService.selectedDateRange();
  private selectedDateQueryParam = this.selectedDateRange ?
    `?startDate=${this.selectedDateRange.start.toISOString()}
    &endDate=${this.selectedDateRange.end.toISOString()}`
    : '';


  get<T>(url: string, headers?: HttpHeaders): Observable<T> {
    return this.httpClient.get<T>(this.apiUrl + url + this.selectedDateQueryParam, {
      headers: headers ? headers : this.headers,
    });
  }

  post<TOut>(url: string, body: unknown, headers?: HttpHeaders): Observable<TOut> {
    return this.httpClient.post<TOut>(this.apiUrl + url, body, {
      headers: headers ? headers : this.headers,
    });
  }

  put<TOut>(
    url: string,
    body: unknown,
    options?: {
      headers?: HttpHeaders;
      observe?: 'body';
      responseType?: 'json';
    },
  ): Observable<TOut> {
    return this.httpClient.put<TOut>(this.apiUrl + url, body, {
      ...options,
      headers: options?.headers ? options.headers : this.headers,
    });
  }

  patch<TOut>(url: string, body: unknown, headers?: HttpHeaders): Observable<TOut> {
    return this.httpClient.patch<TOut>(this.apiUrl + url, body, {
      headers: headers ? headers : this.headers,
    });
  }

  delete<T>(url: string, headers?: HttpHeaders): Observable<T> {
    return this.httpClient.delete<T>(this.apiUrl + url, {
      headers: headers ? headers : this.headers,
    });
  }

  postExportExcelFile(url: string, fileName: string, body: unknown = {}): Observable<any> {
    return this.httpClient
      .post(this.apiUrl + url, body, {
        headers: this.headers,
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((res) => {
          if (res.body) {
            const date = new Date().toISOString().split('T')[0];
            this.downloadFile(res.body, `${fileName}_${date}.xlsx`);
          } else {
            throw new Error('Failed to download file');
          }
        }),
      );
  }

  getExportExcelFile(url: string, fileName: string): Observable<any> {
    return this.httpClient
      .get(this.apiUrl + url, {
        headers: this.headers,
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((res) => {
          if (res.body) {
            const date = new Date().toISOString().split('T')[0];
            this.downloadFile(res.body, `${fileName}_${date}.xlsx`);
          } else {
            throw new Error('Failed to download file');
          }
        }),
      );
  }

  private downloadFile(data: Blob, fileName: string) {
    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  downloadPdFFile(url: string, fileName: string): Observable<any> {
    return this.httpClient
      .get(this.apiUrl + url, {
        headers: this.headers,
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((res) => {
          if (res.body) {
            this.downloadFile(res.body, `${fileName}.pdf`);
          } else {
            throw new Error('Failed to download PDF');
          }
        }),
      );
  }

  postFormData<Tout>(url: string, form: FormData): Observable<Tout> {
    return this.httpClient.post<Tout>(this.apiUrl + url, form);
  }
}
