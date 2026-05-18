import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/multiselect';
import { Checkbox } from 'primeng/checkbox';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { SliderModule } from 'primeng/slider';
import { UsersTableComponent } from './users-table/users-table.component';
import { UsersService } from '../../core/http/backend_service/users.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

@Component({
  selector: 'app-users',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MultiSelectModule,
    Checkbox,
    ToggleSwitchModule,
    SliderModule,
    UsersTableComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export class UsersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly destroyRef = inject(DestroyRef);
  users$ = this.usersService.users$;
  projects$ = this.usersService.projects$;

  searchTerm = '';
  usersFilterForm!: FormGroup;

  ngOnInit(): void {
    this.initializeFilters();

    this.usersFilterForm.valueChanges
      .pipe(startWith(this.usersFilterForm.getRawValue()), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.onFilterChange());
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

  onFilterChange(): void {
    const { searchTerm, projects, hoursRange, zeroHoursUsers } = this.usersFilterForm.value;
    console.log(searchTerm, projects, hoursRange, zeroHoursUsers);
    this.usersService.filterUsers(searchTerm, projects, hoursRange, zeroHoursUsers);
  }
}
