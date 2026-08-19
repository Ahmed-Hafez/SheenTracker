

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ALL_EPICS_MOCK } from '../../mock/all-epics.mock';

// This service is responsible for fetching all epics related to quarter plans from the backend API.
@Injectable({
  providedIn: 'root'
})
export class QuarterPlansAllEpicsService {
  private readonly allEpicsEndpoint = '/api/quarter-plans/all-epics'; // Base URL for the API endpoint

  constructor(private http: HttpClient) {}

  // Method to fetch all epics related to quarter plans
  getAllEpics(): Observable<any> {
    // return this.http.get<any>(this.apiUrl);

    return new Observable(observer => {
      // Simulating an API call with dummy data
      setTimeout(() => {
        observer.next(ALL_EPICS_MOCK); // Replace with actual mock data
        observer.complete();
      }, 1000); // Simulate a delay of 1 second
    });
  }
}


