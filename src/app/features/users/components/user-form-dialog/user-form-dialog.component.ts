import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { Select } from 'primeng/select';

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
  outputVisibleSignal = output<boolean>();
  inputVisibleSignal = input<boolean>(false);
  private readonly fb = inject(FormBuilder);

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
      firstName: ['', [Validators.required, Validators.pattern('^[A-Za-z]+$')]],
      lastName: ['', [Validators.required, Validators.pattern('^[A-Za-z]+$')]],
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('^[A-Za-z0-9._%+-]+@(tildetech\\.ae|shuratech\\.com)$'),
        ],
      ],
      department: ['', Validators.required],
      // Add other form controls
    });
  }

  ngOnInit() {
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
      // Handle form submission, e.g., send data to the server
      console.log(this.userForm.value);
      this.onClosePopup();
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
