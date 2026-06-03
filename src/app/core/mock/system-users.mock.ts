import { SystemUser } from "../models/reponse/system-users.response.model";

export const usersMock: SystemUser[] = [

  // Add Another 10 users
  {
    id: 11,
    fullName: 'User 11',
    email: 'UWZJU@example.com',
    department: 'Department 11',
    azureUserKey: 'azureUserKey11',
    teamLeadId: '11',
    teamLeadName: 'Team Lead 11',
    scrumMasterId: '11',
    scrumMasterName: 'Scrum Master 11',
    productOwnerId: '11',
    productOwnerName: 'Product Owner 11',
    squadName: 'Squad 11',
    title: 'Title 11'
  },
  {
    id: 12,
    fullName: 'User 12',
    email: 'UWZJU@example.com',
    department: 'Department 12',
    azureUserKey: 'azureUserKey12',
    teamLeadId: '12',
    teamLeadName: 'Team Lead 12',
    scrumMasterId: '12',
    scrumMasterName: 'Scrum Master 12',
    productOwnerId: '12',
    productOwnerName: 'Product Owner 12',
    squadName: 'Squad 12',
    title: 'Title 12'
  },
  {
    id: 13,
    fullName: 'User 13',
    email: 'UWZJU@example.com',
    department: 'Department 13',
    azureUserKey: null,
    teamLeadId: '13',
    teamLeadName: 'Team Lead 13',
    scrumMasterId: '13',
    scrumMasterName: 'Scrum Master 13',
    productOwnerId: '13',
    productOwnerName: 'Product Owner 13',
    squadName: 'Squad 13',
    title: 'Title 13'
  }
];
