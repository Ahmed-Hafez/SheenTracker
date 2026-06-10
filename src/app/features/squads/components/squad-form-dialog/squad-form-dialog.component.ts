import { Component, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { Select } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { TextareaModule } from 'primeng/textarea';


import { SystemUsersService } from '../../../../core/http/backend_service/system-users.service';
import { RefreshService } from '../../../../core/services/refresh.service';
import { Squad } from '../../../../core/models/reponse/sqauds.response.model';
import { SquadsService } from '../../../../core/http/backend_service/squads.service';
import { SystemUser } from '../../../../core/models/reponse/system-users.response.model';
import { Department } from '../../../../core/enums/departments.enum';

@Component({
  selector: 'app-squad-form-dialog',
  imports: [DialogModule, ReactiveFormsModule, Select, MessageModule, TextareaModule],
  templateUrl: './squad-form-dialog.component.html',
})
export class SquadFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly refreshService = inject(RefreshService);
  private readonly squadService = inject(SquadsService);
  private readonly systemUsersService = inject(SystemUsersService);

  outputVisibleSignal = output<boolean>();
  inputVisibleSignal = input<boolean>(false);
  isEditMode = input<boolean>(false);
  squadData = input<Squad | null>(null);
  actionLoading = signal(false);
  squadForm!: FormGroup;

  productOwners = signal<SystemUser[]>([]);
  scrumMasters = signal<SystemUser[]>([]);
  isUsersLoading = signal(false);

  visible = false;

  constructor() {
    effect(() => {
      this.visible = this.inputVisibleSignal();
    });
  }

  initializeForm() {
    // Initialize your form here using FormBuilder
    this.squadForm = this.fb.group({
      name: [this.isEditMode() ? this.squadData()?.name : '', Validators.required],
      productOwnerId: [
        this.isEditMode() ? this.squadData()?.productOwnerId : null,
        Validators.required,
      ],
      scrumMasterId: [
        this.isEditMode() ? this.squadData()?.scrumMasterId : null,
        Validators.required,
      ],
      description: [this.isEditMode() ? this.squadData()?.description : null],
    });
  }

  ngOnInit() {
    this.initializeForm();
    this.loadUsersAndFilter();
  }

  loadUsersAndFilter() {
    let users = this.systemUsersService.users$;
    let scrumMasters = [];
    let productOwners = [];
    if (users.length === 0) {
      this.isUsersLoading.set(true);
      this.systemUsersService.getSystemUsers().subscribe({
        next: (users) => {
          scrumMasters = users.filter((user) => user.department === Department.ScrumMaster);
          productOwners = users.filter((user) => user.department === Department.ProductManagement);

          this.scrumMasters.set(scrumMasters);
          this.productOwners.set(productOwners);
          this.isUsersLoading.set(false);
        },
        error: (error) => {
          this.isUsersLoading.set(false);
        },
      });
    } else {
      scrumMasters = users().filter((user) => user.department === Department.ScrumMaster);
      productOwners = users().filter((user) => user.department === Department.ProductManagement);

      this.scrumMasters.set(scrumMasters);
      this.productOwners.set(productOwners);
    }
  }

  getFieldErrorMessage(fieldName: string): string | null {
    const field = this.squadForm.get(fieldName);
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

  onSubmit(): void {
    if (!this.squadForm) return;
    this.squadForm.markAllAsTouched();
    this.squadForm.markAsDirty();
    if (this.squadForm.valid) {
      this.actionLoading.set(true);
      const formData = this.squadForm.value;

      console.log('squadData', formData);
      if (this.isEditMode()) {
        this.squadService.updateSquad(this.squadData()?.id || 0, formData).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Squad updated successfully.',
            });
            this.onClosePopup();
            this.actionLoading.set(false);
            this.refreshService.trigger();
          },
          error: (error) => {
            console.error('Error updating squad:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update squad.',
            });
            this.actionLoading.set(false);
          },
        });
      } else {
        this.squadService.addSquad(formData).subscribe({
          next: (response) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Squad added successfully.',
            });
            this.onClosePopup();
            this.actionLoading.set(false);
            this.refreshService.trigger();
          },

          error: (error) => {
            console.error('Error adding squad:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to add squad.',
            });
            this.actionLoading.set(false);
          },
        });
      }
    }
  }

  onOpenPopup(): void {
    this.visible = true;
  }
  onClosePopup() {
    this.outputVisibleSignal.emit(false);
    this.squadForm.reset();
  }
}
