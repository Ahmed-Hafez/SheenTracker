import { Component, input, OnInit, output } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { DatePickerModule } from 'primeng/datepicker';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  imports: [DatePickerModule, FormsModule],
})
export class HeaderComponent implements OnInit {
  readonly sidebarOpen = input(false);
  readonly isCollapsed = input(false);
  readonly title = input('');
  readonly subtitle = input('');
  readonly toggleSidebar = output<void>();
  readonly toggleCollapse = output<void>();

  rangeDates: Date[] | undefined;

  ngOnInit(): void {
    this.rangeDates = [this.getDateNDaysAgo(30), new Date()];
  }

  datePickerPT = {
    pcInputText: {
      root: ' p-inputtext p-component',
    },
  }

  getDateNDaysAgo(n: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - n);
    return date;
  }
}
