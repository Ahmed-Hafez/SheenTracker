export interface AzureUsers {
  totalUsers: number;
  usersWithHours: number;
  totalHours: number;
  users: User[];
}
/*
{
            "userKey": "aad.njjlnjy4ztqtmmfknc03mwvkltlmmdctmdgyyzg3mwi2n2y0",
            "displayName": "AbdelRahman Ashraf",
            "email": "abdelrahman.ashraf@systemswondertraveleg.onmicrosoft.com",
            "principalName": "abdelrahman.ashraf@systemswondertraveleg.onmicrosoft.com",
            "descriptor": "aad.NjJlNjY4ZTQtMmFkNC03MWVkLTlmMDctMDgyYzg3MWI2N2Y0",
            "avatarUrl": "https://dev.azure.com/tilde-technology/_apis/GraphProfile/MemberAvatars/aad.NjJlNjY4ZTQtMmFkNC03MWVkLTlmMDctMDgyYzg3MWI2N2Y0",
            "phoneNumber": null,
            "expectedHours": null,
            "totalHours": 17.5,
            "projectsCount": 1,
            "workItemsCount": 5,
            "productOwnerNames": [
                "Ahmed Abdelghani Ali Albahloul"
            ],
            "scrumMasterNames": [
                "Maryam Sherif"
            ],
            "projectNames": [
                "NDC Portal"
            ],
            "projectHoursMap": {
                "NDC Portal": 17.5
            }
        },
*/
export interface User {
  userKey: string;
  displayName: string;
  email: string;
  principalName: string;
  descriptor: string;
  avatarUrl?: string;
  totalHours: number;
  expectedHours: number | null;
  projectsCount: number;
  workItemsCount: number;
  projectNames: string[];
  projectHoursMap: { [key: string]: number };
  productOwnerNames: string[];
  scrumMasterNames: string[];

}
