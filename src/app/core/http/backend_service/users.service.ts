import { Injectable, computed, signal } from '@angular/core';
import { usersMock } from '../../mock/users.mock';
import { User } from '../../models/reponse/users.response.model';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private readonly allUsers = signal<User[]>(usersMock);
  private readonly filteredUsers = signal<User[]>(usersMock);

  users$ = this.filteredUsers.asReadonly();
  projects$ = computed(() => this.getUsersProjects(this.allUsers()));

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
    if (zeroHoursUsers) {
      filteredUsers = filteredUsers.filter((user) => user.totalHours > 0);
    }

    this.filteredUsers.set(filteredUsers);
  }

  // exportUsersToCSV() {
  //   const usersData = this.users().users;

  // }
}
