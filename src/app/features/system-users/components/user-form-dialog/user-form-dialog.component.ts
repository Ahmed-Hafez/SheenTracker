import { Component, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { Select } from 'primeng/select';
import { SystemUsersService } from '../../../../core/http/backend_service/system-users.service';
import { MessageService } from 'primeng/api';
import { SystemUsers } from '../../../../core/models/reponse/system-users.response.model';

enum Department {
  Backend = 'Backend',
  Frontend = 'Frontend',
  QualityAssurance = 'Quality Assurance',
  ProductManagement = 'Product Management',
  ScrumMaster = 'Scrum Master',
  DevOps = 'DevOps',
  UIUXDesign = 'UI/UX Design',
}

@Component({
  selector: 'app-user-form-dialog',
  imports: [DialogModule, ReactiveFormsModule, Select, MessageModule],
  templateUrl: './user-form-dialog.component.html',
})
export class UserFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly appUsersService = inject(SystemUsersService);

  outputVisibleSignal = output<boolean>();
  inputVisibleSignal = input<boolean>(false);
  isEditMode = input<boolean>(false);
  userData = input<SystemUsers | null>(null); // Replace 'any' with your actual user data type
  actionLoading = signal(false);
  userForm!: FormGroup;

  visible = false;

  constructor() {
    effect(() => {
      this.visible = this.inputVisibleSignal();
    });
  }

  departments = Object.values(Department);

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
      department: [this.isEditMode() ? this.userData()?.department : '', Validators.required],
      // Add other form controls
    });
  }

  ngOnInit() {
    this.initializeForm();
    console.log('User Data in Dialog:', this.userData());
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

  onSubmit() {
    this.userForm.markAllAsTouched();
    this.userForm.markAsDirty();
    if (this.userForm.valid) {
      this.actionLoading.set(true);
      const formData = this.userForm.value;

      let systemUserData: SystemUsers = {
        fullName: formData.firstName + ' ' + formData.lastName,
        email: formData.email,
        department: formData.department,
        userKey: this.userData()?.userKey || null,
      }
      if (this.isEditMode()) {
        this.appUsersService.updateAppUser(this.userData()?.userKey || '', systemUserData).subscribe({
          next: (response) => {
             this.messageService.add({
               severity: 'success',
               summary: 'Success',
               detail: 'User updated successfully.',
             });
            this.onClosePopup();
            this.actionLoading.set(false);
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
