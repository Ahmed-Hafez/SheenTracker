import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Select } from 'primeng/select';

import { RefreshService } from '../../../../core/services/refresh.service';
import { PortalUserResponse } from '../../../../core/models/reponse/portal-user.response.model';
import { PortalUsersService } from '../../../../core/http/backend_service/portal-users.service';
import { MetaDataService } from '../../../../core/http/backend_service/meta-data.service';
import { AddPortalUserRequest } from '../../../../core/models/request/add-portal-user.model';
import { AuthService } from '../../../../core/http/backend_service/auth.service';
import { describeRoleAccess, isSuperAdmin } from '../../../../core/utils/roles.util';

interface PasswordRequirement {
  id: string;
  label: string;
  test: (value: string) => boolean;
}

@Component({
  selector: 'app-auth-user-form-dialog',
  imports: [
    DialogModule,
    ReactiveFormsModule,
    MessageModule,
    PasswordModule,
    ToggleSwitchModule,
    Select,
  ],
  templateUrl: './auth-user-form-dialog.component.html',
  styleUrl: './auth-user-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthUserFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly refreshService = inject(RefreshService);
  private readonly portalUsersService = inject(PortalUsersService);
  private readonly metaDataService = inject(MetaDataService);
  private readonly authService = inject(AuthService);

  outputVisibleSignal = output<boolean>();
  inputVisibleSignal = input<boolean>(false);
  isEditMode = input<boolean>(false);
  userData = input<PortalUserResponse | null>(null);

  actionLoading = signal(false);
  passwordValue = signal('');
  userForm!: FormGroup;
  requirements: PasswordRequirement[] = [];

  private readonly currentUserIsSuperAdmin = isSuperAdmin(this.authService.getUserData()?.roles);

  /** The backend rejects assigning SuperAdmin unless the current user is one, so hide it otherwise. */
  roles = computed(() =>
    this.currentUserIsSuperAdmin
      ? this.metaDataService.roles$()
      : this.metaDataService.roles$().filter((role) => !isSuperAdmin([role])),
  );
  selectedRole = signal<string | null>(null);
  /** Roles are baked into the JWT, so a change only applies after the user signs in again. */
  isRoleChanged = computed(
    () => this.isEditMode() && !!this.selectedRole() && this.selectedRole() !== this.userData()?.role,
  );
  isRolesLoading = this.metaDataService.isRolesLoading;
  /** One-line summary of what the selected role can open, shown under the Role field. */
  roleAccess = computed(() => describeRoleAccess(this.selectedRole()));

  readonly visible = linkedSignal(() => this.inputVisibleSignal());

  initializeForm() {
    const editMode = this.isEditMode();
    const data = this.userData();

    this.userForm = this.fb.group(
      {
        firstName: [
          editMode ? data?.firstName : '',
          [Validators.required, Validators.pattern('^[A-Za-z]+$')],
        ],
        lastName: [
          editMode ? data?.lastName : '',
          [Validators.required, Validators.pattern('^[A-Za-z]+$')],
        ],
        email: [editMode ? data?.email : '', [Validators.required, Validators.email]],
        title: [editMode ? data?.title : '', Validators.required],
        role: [editMode ? data?.role : null, Validators.required],
        isActive: [editMode ? (data?.isActive ?? true) : true],
        password: ['', editMode ? [] : [Validators.required, this.passwordStrengthValidator()]],
        confirmPassword: ['', editMode ? [] : [Validators.required]],
      },
      { validators: editMode ? null : this.passwordMatchValidator() },
    );

    this.userForm.get('password')?.valueChanges.subscribe((value) => {
      this.passwordValue.set(value ?? '');
    });

    this.selectedRole.set(this.userForm.get('role')?.value ?? null);
    this.userForm.get('role')?.valueChanges.subscribe((value) => {
      this.selectedRole.set(value ?? null);
    });
  }

  initializePasswordRequirments() {
    this.requirements = [
      { id: 'minLength', label: '8+ characters', test: (v: string) => v.length >= 8 },
      { id: 'uppercase', label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
      { id: 'number', label: 'Number', test: (v: string) => /[0-9]/.test(v) },
      {
        id: 'symbol',
        label: 'Special character',
        test: (v: string) => /[^a-zA-Z0-9]/.test(v),
      },
    ];
  }

  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value ?? '';
      if (!value) {
        return null;
      }
      const allMet = this.requirements.every((req) => req.test(value));
      return allMet ? null : { passwordStrength: true };
    };
  }

  passwordMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const password = group.get('password')?.value;
      const confirmPassword = group.get('confirmPassword')?.value;
      if (password !== confirmPassword) {
        group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      }
      const confirmControl = group.get('confirmPassword');
      if (confirmControl?.hasError('passwordMismatch')) {
        const errors = { ...confirmControl.errors };
        delete errors['passwordMismatch'];
        confirmControl.setErrors(Object.keys(errors).length ? errors : null);
      }
      return null;
    };
  }

  isRequirementMet(req: PasswordRequirement): boolean {
    return req.test(this.passwordValue());
  }

  ngOnInit() {
    this.initializePasswordRequirments();
    this.initializeForm();
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
      return 'Enter an email like name@company.com.';
    }

    if (field.hasError('pattern')) {
      return this.getPatternFieldMessage(fieldName);
    }

    if (field.hasError('passwordStrength')) {
      return 'Password does not meet all requirements.';
    }

    if (field.hasError('passwordMismatch')) {
      return 'Passwords do not match.';
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
      case 'title':
        return 'Title is required.';
      case 'role':
        return 'Role is required.';
      case 'password':
        return 'Password is required.';
      case 'confirmPassword':
        return 'Type the password again.';
      default:
        return 'This field is required.';
    }
  }

  private getPatternFieldMessage(fieldName: string): string {
    switch (fieldName) {
      case 'firstName':
        return 'Use letters only, as one word.';
      case 'lastName':
        return 'Use letters only, as one word.';
      default:
        return 'Invalid format.';
    }
  }

  isUserActive(): boolean {
    return this.userForm.get('isActive')?.value;
  }

  onSubmit() {
    this.userForm.markAllAsTouched();
    this.userForm.markAsDirty();
    if (!this.userForm.valid) {
      return;
    }

    this.actionLoading.set(true);
    const formData = this.userForm.value;

    const userPayload: AddPortalUserRequest = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      title: formData.title,
      role: formData.role,
      isActive: formData.isActive,
      password: formData.password,
    };

    if (this.isEditMode()) {
      const updatePayload: Partial<AddPortalUserRequest> = {
        firstName: userPayload.firstName,
        lastName: userPayload.lastName,
        email: userPayload.email,
        title: userPayload.title,
        role: userPayload.role,
        isActive: userPayload.isActive,
      };
      if (formData.password) {
        updatePayload.password = formData.password;
      }

      this.portalUsersService.updatePortalUser(this.userData()!.id, updatePayload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Changes saved',
            detail: `${userPayload.firstName} ${userPayload.lastName}'s account is updated.`,
          });
          this.onClosePopup();
          this.actionLoading.set(false);
          this.refreshService.trigger();
        },
        // The error interceptor shows the server's reason; keep the form so nothing is lost.
        error: () => this.actionLoading.set(false),
      });
    } else {
      this.portalUsersService.addPortalUser(userPayload).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'User added',
            detail: userPayload.isActive
              ? `${userPayload.firstName} ${userPayload.lastName} can now sign in with ${userPayload.email}.`
              : `${userPayload.firstName} ${userPayload.lastName} was added as inactive and can't sign in yet.`,
          });
          this.onClosePopup();
          this.actionLoading.set(false);
          this.refreshService.trigger();
        },
        error: () => this.actionLoading.set(false),
      });
    }
  }

  /** Start keyboard users on the first field rather than the dialog's close button. */
  focusFirstField() {
    document.getElementById('firstName')?.focus();
  }

  onClosePopup() {
    this.visible.set(false);
    this.outputVisibleSignal.emit(false);
    this.passwordValue.set('');
    this.userForm.reset();
  }
}
