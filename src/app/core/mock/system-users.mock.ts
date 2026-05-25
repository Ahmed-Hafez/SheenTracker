import { SystemUsers } from "../models/reponse/system-users.response.model";

export const usersMock: SystemUsers[] = [

  // Add Another 10 users
  {
    userKey: 'user1',
    fullName: 'John Doe',
    email: 'oM6l4@shuratech.com',
    department: 'Backend',
  },
  {
    userKey: 'user2',
    fullName: 'Jane Smith',
    email: 'jane.smith@shuratech.com',
    department: 'Frontend',
  },
  {
    userKey: 'user3',
    fullName: 'Alice Johnson',
    email: 'alice.johnson@tildetech.ae',
    department: 'Scrum Master',
  }
];
