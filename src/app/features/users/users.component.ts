import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { Checkbox } from "primeng/checkbox";
import { ToggleSwitchModule } from 'primeng/toggleswitch';


@Component({
  selector: 'app-users',
  imports: [FormsModule, ReactiveFormsModule, MultiSelectModule, Checkbox, ToggleSwitchModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);

  searchTerm = '';
  usersFilterForm!: FormGroup;

  projects: { name: string; code: string }[] = [
    { name: 'New York', code: 'NY' },
    { name: 'Rome', code: 'RM' },
    { name: 'London', code: 'LDN' },
    { name: 'Istanbul', code: 'IST' },
    { name: 'Paris', code: 'PRS' },
  ];

  ngOnInit(): void {
    this.initializeFilters();
  }

  initializeFilters(): void {
    this.usersFilterForm = this.fb.group({
      searchTerm: [''],
      projects: [''],
      workItemStatus: [''],
      hoursRange: [''],
      zeroHoursUsers: [false],
    });
  }
}
