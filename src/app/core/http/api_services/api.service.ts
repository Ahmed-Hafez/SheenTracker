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

  private readonly httpClient = inject(HttpClient);
  private readonly dateService = inject(DateService);

  get<T>(url: string, headers?: HttpHeaders): Observable<T> {
    const queryParams = this.getDateRangeQueryParams();
    const fullUrl = this.apiUrl + url + queryParams;
    return this.httpClient.get<T>(fullUrl, {
      headers: headers,
    });
  }

  post<TOut>(url: string, body: unknown, headers?: HttpHeaders): Observable<TOut> {
    return this.httpClient.post<TOut>(this.apiUrl + url, body, {
      headers: headers,
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
      headers: options?.headers,
    });
  }

  patch<TOut>(url: string, body: unknown, headers?: HttpHeaders): Observable<TOut> {
    return this.httpClient.patch<TOut>(this.apiUrl + url, body, {
      headers: headers,
    });
  }

  delete<T>(url: string, headers?: HttpHeaders): Observable<T> {
    return this.httpClient.delete<T>(this.apiUrl + url, {
      headers: headers,
    });
  }

  private getDateRangeQueryParams(): string {
    const selectedDateRange = this.dateService.selectedDateRange();
    if (selectedDateRange && selectedDateRange.start && selectedDateRange.end) {
      const fromDate = this.formatLocalDate(selectedDateRange.start);
      const toDate = this.formatLocalDate(selectedDateRange.end);
      return `?fromDate=${fromDate}&toDate=${toDate}`;
    }
    return '';
  }

  private formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
