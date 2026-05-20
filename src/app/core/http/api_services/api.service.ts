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

  private selectedDateRange = this.dateService.selectedDateRange();
  private selectedDateQueryParam = this.selectedDateRange ?
    `?fromDate=${this.selectedDateRange.start.toISOString().split('T')[0].trim()}
    &toDate=${this.selectedDateRange.end.toISOString().split('T')[0].trim()}`
    : '';


  get<T>(url: string, headers?: HttpHeaders): Observable<T> {
    return this.httpClient.get<T>(this.apiUrl + url + this.selectedDateQueryParam, {
      headers: headers 
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
