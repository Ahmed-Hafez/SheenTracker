import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { Checkbox } from "primeng/checkbox";
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SliderModule } from 'primeng/slider';
import { UsersTableComponent } from "./users-table/users-table.component";
import { UsersService } from '../../core/http/backend_service/users.service';



@Component({
  selector: 'app-users',
  imports: [FormsModule, ReactiveFormsModule, MultiSelectModule, Checkbox, ToggleSwitchModule, SliderModule, UsersTableComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService); 
  users$ = this.usersService.users$;
  projects$ = this.usersService.projects$;
  

  searchTerm = '';
  usersFilterForm!: FormGroup;

  

  ngOnInit(): void {
    this.initializeFilters();
  }

  initializeFilters(): void {
    this.usersFilterForm = this.fb.group({
      searchTerm: [''],
      projects: [''],
      activeWorkItems: [true],
      resolvedWorkItems: [true],
      closedWorkItems: [true],
      hoursRange: [''],
      zeroHoursUsers: [false],
    });
  }
}
