export interface SystemUser {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  department: number;
  azureUserKey: string | null;
  teamLeadId: number | null;
  teamLeadName: string | null;
  userSquads: UserSquad[];
  seniority: number;
  title: string;
}

export interface UserSquad {
  id: number;
  name: string;
  productOwner: SquadManger;
  scrumMaster: SquadManger;
}

export interface SquadManger  {
    id: number;
    fullName: string;
    email: string;
    azureUserKey: string;
  };
