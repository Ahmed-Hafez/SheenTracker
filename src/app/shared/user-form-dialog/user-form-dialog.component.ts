import { Component, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { Select } from 'primeng/select';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';

import { SystemUsersService } from '../../core/http/backend_service/system-users.service';
import { RefreshService } from '../../core/services/refresh.service';
import { MessageService } from 'primeng/api';
import { MetaDataService } from '../../core/http/backend_service/meta-data.service';
import { SystemUser } from '../../core/models/reponse/system-users.response.model';
import { Department, Departments } from '../../core/enums/departments.enum';
import { Seniorities, Seniority } from '../../core/enums/seniority.enum';
import { AddSystemUserRequest } from '../../core/models/request/add-system-user.request.model';

@Component({
  selector: 'app-user-form-dialog',
  imports: [
    DialogModule,
    ReactiveFormsModule,
    Select,
    MessageModule,
    InputGroupAddon,
    InputGroup,
    InputText,
  ],
  templateUrl: './user-form-dialog.component.html',
})
export class UserFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly appUsersService = inject(SystemUsersService);
  private readonly metaDataService = inject(MetaDataService);
  private readonly refreshService = inject(RefreshService);

  outputVisibleSignal = output<boolean>();
  inputVisibleSignal = input<boolean>(false);
  isEditMode = input<boolean>(false);
  userData = input<SystemUser | null>(null);
  users = input<SystemUser[] | null>(null);
  actionLoading = signal(false);
  userForm!: FormGroup;

  teamLeads = signal<SystemUser[]>([]);
  isTeamLeadLoading = signal(false);
  isTeamLead = signal(false);
  isManager = signal(false);

  visible = false;

  constructor() {
    effect(() => {
      this.visible = this.inputVisibleSignal();
    });
  }

  departments = Departments;
  seniorities = Seniorities;

  squads = this.metaDataService.metaDataSquads$;
  isSquadsLoading = this.metaDataService.isSquadsLoading;

  initializeForm() {
    // Initialize your form here using FormBuilder
    this.userForm = this.fb.group({
      firstName: [
        this.isEditMode() ? this.userData()?.fullName.split(' ')[0] : '',
        [Validators.required, Validators.pattern('^[A-Za-z]+$')],
      ],
      lastName: [
        this.isEditMode() ? this.userData()?.fullName.split(' ')[1] : '',
        [Validators.required, Validators.pattern('^[A-Za-z]+$')],
      ],
      email: [
        this.isEditMode() ? this.userData()?.email : '',
        [
          Validators.required,
          Validators.pattern('^[A-Za-z0-9._%+-]+@(tildetech\\.ae|shuratech\\.com)$'),
        ],
      ],
      department: [this.isEditMode() ? this.userData()?.department : null, Validators.required],
      squadName: [this.isEditMode() ? this.userData()?.squadId : null],
      seniority: [
        this.isEditMode() ? this.userData()?.seniority : Seniority.Junior,
        Validators.required,
      ],
      jobTitle: [this.isEditMode() ? this.userData()?.title : '', Validators.required],
      teamleadId: [this.isEditMode() ? this.userData()?.teamLeadId : null],
    });
  }

  ngOnInit() {
    this.initializeForm();
    this.getDepartmentTeamleads();
    this.disableTeamleadSelection();
  }

  getFieldErrorMessage(fieldName: string): string | null {
    const field = this.userForm.get(fieldName);
    if (!field || !(field.invalid && (field.dirty || field.touched))) {
      return null;
    }

    if (field.hasError('required')) {
      return this.getRequiredFieldMessage(fieldName);
    }

    if (field.hasError('pattern')) {
      return this.getPatternFieldMessage(fieldName);
    }

    return 'Invalid value.';
  }

  private getRequiredFieldMessage(fieldName: string): string {
    switch (fieldName) {
      case 'firstName':
        return 'First name is required.';
      case 'lastName':
        return 'Last name is required.';
      case 'email':
        return 'Email is required.';
      case 'department':
        return 'Department is required.';
      default:
        return 'This field is required.';
    }
  }

  private getPatternFieldMessage(fieldName: string): string {
    switch (fieldName) {
      case 'firstName':
        return 'First name must be one word';
      case 'lastName':
        return 'Last name must be one word';
      case 'email':
        return 'Email must end with @tildetech.ae or @shuratech.com.';
      default:
        return 'Invalid format.';
    }
  }

  getDepartmentTeamleads() {
    // disable teamlead selection if no department is selected
    if (!this.userForm.get('department')) {
      this.userForm.get('teamleadId')?.disable();
    }

    if (this.isEditMode()) {
      this.isTeamLeadLoading.set(true);
      let department = this.userData()?.department;
      this.appUsersService.getSystemTeamLeads(department ? department : 0).subscribe({
        next: (teamleads) => {
          this.teamLeads.set(teamleads);
          this.isTeamLeadLoading.set(false);
        },
        error: () => {
          this.teamLeads.set([]);
          this.isTeamLeadLoading.set(false);
        },
      });
    }
    this.userForm.get('department')?.valueChanges.subscribe((dept) => {
      let seniority: number = this.userForm.get('seniority')?.getRawValue();

      if (dept === null) {
        return;
      } else if (
        dept === Department.ScrumMaster ||
        dept === Department.ProductManagement ||
        seniority === Seniority.Lead ||
        seniority === Seniority.Manager
      ) {
        this.userForm.get('teamleadId')?.disable();
        return;
      }
      this.userForm.get('teamleadId')?.enable();

      this.isTeamLeadLoading.set(true);
      this.appUsersService.getSystemTeamLeads(dept).subscribe({
        next: (teamleads) => {
          this.teamLeads.set(teamleads);
          this.isTeamLeadLoading.set(false);
        },
        error: () => {
          this.teamLeads.set([]);
          this.isTeamLeadLoading.set(false);
        },
      });
    });
  }

  disableTeamleadSelection() {
    let seniority = this.userForm.get('seniority');
    if (this.isEditMode()) {
      if (seniority?.value === Seniority.Lead) {
        this.userForm.get('teamleadId')?.reset();
        this.isTeamLead.set(true);
        this.isManager.set(false);
      } else if (seniority?.value === Seniority.Manager) {
        this.userForm.get('teamleadId')?.reset();
        this.isManager.set(true);
        this.isTeamLead.set(false);
      } else {
        this.isManager.set(false);
        this.isTeamLead.set(false);
      }
    }
    this.userForm.get('seniority')?.valueChanges.subscribe((seniority) => {
      console.log(this.userForm.get('seniority')?.value);
      if (seniority === Seniority.Lead) {
        this.userForm.get('teamleadId')?.reset();
        this.isTeamLead.set(true);
        this.isManager.set(false);
      } else if (seniority === Seniority.Manager) {
        this.userForm.get('teamleadId')?.reset();
        this.isManager.set(true);
        this.isTeamLead.set(false);
      } else {
        this.isManager.set(false);
        this.isTeamLead.set(false);
      }
    });
  }
  onSubmit() {
    this.userForm.markAllAsTouched();
    this.userForm.markAsDirty();
    if (this.userForm.valid) {
      this.actionLoading.set(true);
      const formData = this.userForm.value;

      let systemUserData: AddSystemUserRequest = {
        fullName: formData.firstName + ' ' + formData.lastName,
        email: formData.email,
        department: formData.department,
        azureUserKey: this.userData()?.azureUserKey || null,
        teamLeadId: formData.teamleadId,
        squadId: formData.squadName,
        title: formData.jobTitle,
        seniority: formData.seniority,
      };

      console.log('systemUserData', systemUserData);
      if (this.isEditMode()) {
        this.appUsersService.updateAppUser(this.userData()?.id || 0, systemUserData).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User updated successfully.',
            });
            this.onClosePopup();
            this.actionLoading.set(false);
            this.refreshService.trigger();
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update user.',
            });
            this.actionLoading.set(false);
          },
        });
      } else {
        this.appUsersService.addAppUser(systemUserData).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User added successfully.',
            });
            this.onClosePopup();
            this.actionLoading.set(false);
            this.refreshService.trigger();
          },

          error: (error) => {
            console.error('Error adding user:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to add user.',
            });
            this.actionLoading.set(false);
          },
        });
      }
    }
  }

  onOpenPopup() {
    this.visible = true;
  }
  onClosePopup() {
    this.outputVisibleSignal.emit(false);
    this.userForm.reset();
  }
}
