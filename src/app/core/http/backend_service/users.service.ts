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

  getUsersProjects() : string[] {
    // Implement API call to fetch users projects data
    let allProjects: string[] = [];
    this.users().users.forEach(user => {
      allProjects = allProjects.concat(user.projectNames);
    });
    return allProjects;
  }
}
