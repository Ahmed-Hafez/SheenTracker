import { Injectable, signal } from '@angular/core';
import { usersMock } from '../../mock/users.mock';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private users = signal(usersMock);
  private projects = signal(this.getUsersProjects());
  users$ = this.users.asReadonly();
  projects$ = this.projects.asReadonly();

  getUsers() {
    // Implement API call to fetch users data
    return this.users();
  }

  getUsersProjects(): string[] {
    let allProjects: string[] = [];
    this.users().users.forEach((user) => {
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
    let filteredUsers = this.users().users;
    // Apply filters based on user input
    return filteredUsers;
  }
}
