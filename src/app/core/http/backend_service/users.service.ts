import { Injectable, computed, inject, signal } from '@angular/core';
import { usersMock } from '../../mock/users.mock';
import { User } from '../../models/reponse/users.response.model';
import { ngxCsv } from 'ngx-csv/ngx-csv';
import { of } from 'rxjs';
import { ApiService } from '../api_services/api.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly apiService = inject(ApiService);

  private readonly allUsers = signal<User[]>(usersMock.users);
  private readonly filteredUsers = signal<User[]>(usersMock.users);

  private usersEndpoint = '/users';

  users$ = this.filteredUsers.asReadonly();
  projects$ = computed(() => this.getUsersProjects(this.allUsers()));

  getUsersKpis() {
    return of(usersMock.userKpis);
  }

  getUsers() {
    // Implement API call to fetch users data
    return this.allUsers();
  }

  getUsersProjects(users = this.allUsers()): string[] {
    let allProjects: string[] = [];
    users.forEach((user) => {
      // skip if projectName is already in the list
      if (user.projectNames) {
        user.projectNames.forEach((project) => {
          if (!allProjects.includes(project)) {
            allProjects.push(project);
          }
        });
      }
    });
    return allProjects;
  }

  filterUsers(
    searchTerm: string,
    selectedProjects: string[],
    hoursRange: number[],
    zeroHoursUsers: boolean,
  ) {
    let filteredUsers = this.allUsers();
    const normalizedSearch = (searchTerm ?? '').trim();
    const normalizedProjects = Array.isArray(selectedProjects) ? selectedProjects : [];
    const normalizedHoursRange = Array.isArray(hoursRange)
      ? hoursRange
      : typeof hoursRange === 'number'
        ? [0, hoursRange]
        : [];

    if (normalizedSearch) {
      filteredUsers = filteredUsers.filter(
        (user) =>
          user.displayName.toLowerCase().includes(normalizedSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(normalizedSearch.toLowerCase()),
      );
    }
    if (normalizedProjects.length > 0) {
      filteredUsers = filteredUsers.filter((user) =>
        user.projectNames.some((project) => normalizedProjects.includes(project)),
      );
    }
    if (normalizedHoursRange.length === 2) {
      const [minHours, maxHours] = normalizedHoursRange;
      filteredUsers = filteredUsers.filter(
        (user) => user.totalHours >= minHours && user.totalHours <= maxHours,
      );
    }
    if (!zeroHoursUsers) {
      filteredUsers = filteredUsers.filter((user) => user.totalHours > 0);
    }

    this.filteredUsers.set(filteredUsers);
  }

  exportUsersToCSV(users: User[]) {
    let optimizedUsers = [];
    const options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalSeparator: '.',
      showLabels: true,
      showTitle: false,
      title: 'User Report',
      useTextFile: false,
      useBom: true, // Ensures Excel compatibility
      headers: [
        'userKey',
        'displayName',
        'email',
        'principalName',
        'descriptor',
        'projectsCount',
        'workItemsCount',
        'totalHours',
        'projectNames',
      ], // Custom column titles
    };

    optimizedUsers = users.map((user) => ({
      ...user,
      projectNames: user.projectNames.join('|'),
    }));

    // Instantiate to trigger immediate browser download
    new ngxCsv(optimizedUsers, 'User_Report_File', options);
  }
}
