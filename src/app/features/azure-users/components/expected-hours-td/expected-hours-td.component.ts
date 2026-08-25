import { Component, computed, inject, input } from '@angular/core';
import { UsersService } from '../../../../core/http/backend_service/azure-users.service';
import { DateService } from '../../../../core/services/date.service';
import { User } from '../../../../core/models/reponse/azure-users.response.model';

@Component({
  selector: 'app-expected-hours-td',
  imports: [],
  templateUrl: './expected-hours-td.component.html',
  styleUrl: './expected-hours-td.component.scss',
})
export class ExpectedHoursTdComponent {

  user = input.required<User>();
  private readonly userService = inject(UsersService);
  private readonly dateService = inject(DateService);

  getExpectedHoursOrDefault = computed(() => {
    var workingDays = this.dateService.weekdaysCount() - this.dateService.holidaysCount(); // Ensure that the computed value is updated when weekdaysCount changes
    return this.userService.getExpectedHoursOrDefault(this.user(), workingDays);
  });
  

}
