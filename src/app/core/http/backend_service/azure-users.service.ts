import { Injectable, inject, signal } from '@angular/core';
import { User, AzureUsers } from '../../models/reponse/azure-users.response.model';
import * as XLSX from 'xlsx';
import { map, Observable } from 'rxjs';
import { ApiService } from '../api_services/api.service';
import { DateService } from '../../services/date.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly apiService = inject(ApiService);
  private readonly dateService = inject(DateService);

  private usersResponse = signal<AzureUsers>({} as AzureUsers);
  private readonly allUsers = signal<User[]>([]);
  private readonly filteredUsers = signal<User[]>([]);
  private readonly usersProjects = signal<string[]>([]);

  private usersEndpoint = 'AzureDevOps/users';

  users$ = this.filteredUsers.asReadonly();
  projects$ = this.usersProjects.asReadonly();
  usersResponse$ = this.usersResponse.asReadonly();

  getAzureUsers(): Observable<AzureUsers> {
    return this.apiService.get<AzureUsers>(this.usersEndpoint).pipe(
      map((response) => {
        this.usersResponse.set(response);
        this.allUsers.set(response.users);
        this.filteredUsers.set(response.users);
        this.getAzureUsersProjects(); // Update projects list based on the fetched users
        return response;
      }),
    );
  }

  getAzureUsersData(): User[] {
    // Implement API call to fetch users data
    return this.usersResponse().users;
  }

  getAzureUsersProjects(users = this.allUsers()): string[] {
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
    this.usersProjects.set(allProjects);
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
    const optimizedUsers = users.map((user) => ({
      displayName: user.displayName,
      email: user.email,
      expectedHours: this.dateService.targetHoursCount(),
      actualHours: user.totalHours,
      missedHours: Math.max(0, this.dateService.targetHoursCount() - user.totalHours),
      extraHours: Math.max(0, user.totalHours - this.dateService.targetHoursCount()),
      compliancePercentage:
        user.totalHours > 0
          ? Math.round((user.totalHours / this.dateService.targetHoursCount()) * 100) + '%'
          : '0%',
      projectsCount: user.projectsCount,
      workItemsCount: user.workItemsCount,
      projectNames: this.projectNameAndHours(user).join(' | '),
    }));

    const worksheet = XLSX.utils.json_to_sheet(optimizedUsers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, 'User_Report_File.xlsx');
  }

  projectNameAndHours(user: User): string[] {
    const projectNameAndHours = [];
    for (const [project, hours] of Object.entries(user.projectHoursMap)) {
      projectNameAndHours.push(`${project} - ${((hours / user.totalHours) * 100).toFixed(2)} %`);
    }
    return projectNameAndHours;
  }

  isUserAchieved(totalHours: number): boolean {
    return totalHours >= this.dateService.targetHoursCount();
  }
}
