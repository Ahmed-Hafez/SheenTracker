import { Component, effect, inject, input, OnInit, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { RefreshService } from '../../../../core/services/refresh.service';
import { PortalUserResponse } from '../../../../core/models/reponse/portal-user.response.model';
import { PasswordModule } from 'primeng/password';

interface PasswordRequirement {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

@Component({
  selector: 'app-auth-user-form-dialog',
  imports: [DialogModule, ReactiveFormsModule, MessageModule, PasswordModule],
  templateUrl: './auth-user-form-dialog.component.html',
})
export class AuthUserFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly refreshService = inject(RefreshService);

  outputVisibleSignal = output<boolean>();
  inputVisibleSignal = input<boolean>(false);
  isEditMode = input<boolean>(false);
  userData = input<PortalUserResponse | null>(null);
  actionLoading = signal(false);
  userForm!: FormGroup;
  requirements: PasswordRequirement[] = [];

  visible = false;

  constructor() {
    effect(() => {
      this.visible = this.inputVisibleSignal();
    });
  }

  initializeForm() {
    // Initialize your form here using FormBuilder
    this.userForm = this.fb.group({
      firstName: [
        this.isEditMode() ? this.userData()?.firstName : '',
        [Validators.required, Validators.pattern('^[A-Za-z]+$')],
      ],
      lastName: [
        this.isEditMode() ? this.userData()?.lastName : '',
        [Validators.required, Validators.pattern('^[A-Za-z]+$')],
      ],
      email: [
        this.isEditMode() ? this.userData()?.email : '',
        [Validators.required, Validators.email],
      ],
      title: [this.isEditMode() ? this.userData()?.title : '', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  initializePasswordRequirments() {
    this.requirements = [
      { id: 'minLength', label: 'At least 12 characters', test: (v: string) => v.length >= 12 },
      { id: 'uppercase', label: 'Contains uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
      { id: 'lowercase', label: 'Contains lowercase letter', test: (v: string) => /[a-z]/.test(v) },
      { id: 'number', label: 'Contains number', test: (v: string) => /[0-9]/.test(v) },
      {
        id: 'symbol',
        label: 'Contains special character',
        test: (v: string) => /[^a-zA-Z0-9]/.test(v),
      },
    ];
  }

  ngOnInit() {
    this.initializeForm();
    this.initializePasswordRequirments();
  }

  getFieldErrorMessage(fieldName: string): string | null {
    const field = this.userForm.get(fieldName);
    if (!field || !(field.invalid && (field.dirty || field.touched))) {
      return null;
    }

    if (field.hasError('required')) {
      return this.getRequiredFieldMessage(fieldName);
    }

    if (field.hasError('email')) {
      return 'Invalid email format.';
    }

    if (field.hasError('pattern')) {
      return this.getPatternFieldMessage(fieldName);
    }
    if (field.hasError('min')) {
      return this.getMinFieldMessage(fieldName);
    }

    return 'Invalid value.';
  }

  private getMinFieldMessage(fieldName: string): string {
    switch (fieldName) {
      case 'expectedHours':
        return 'Expected hours must be a positive number or zero.';
      default:
        return 'Invalid value.';
    }
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
