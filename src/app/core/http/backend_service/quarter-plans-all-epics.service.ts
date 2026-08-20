import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api_services/api.service';
import { AllEpicsResponse } from '../../models/reponse/backlog-response.model';

@Injectable({
  providedIn: 'root'
})
export class QuarterPlansAllEpicsService {
  private readonly allEpicsEndpoint = 'dashboard/hierarchy'; 

  constructor(private http: ApiService) {}

  getAllEpics(pageNumber: number): Observable<AllEpicsResponse> {
    return this.http.get<AllEpicsResponse>(`${this.allEpicsEndpoint}?pageNumber=${pageNumber}&pageSize=10`);
  }
}


