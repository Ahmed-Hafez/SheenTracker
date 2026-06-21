import { Component, effect, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Dialog } from "primeng/dialog";
import { InputTextModule } from 'primeng/inputtext';
import { DateService } from '../../../../core/services/date.service';

@Component({
  selector: 'app-holiday-calculator',
  imports: [Dialog, InputTextModule, FormsModule],
  templateUrl: './holiday-calculator.component.html',
  styleUrl: './holiday-calculator.component.scss',
})
export class HolidayCalculatorComponent {
  private dateService = inject(DateService);

  get weekdaysCount() {
    return this.dateService.weekdaysCount();
  }

  visible = false;
  days = 0;
  hours = 0;

  outputVisibleSignal = output<boolean>();
  inputVisibleSignal = input<boolean>(false);

  constructor() {
    effect(() => {
      this.visible = this.inputVisibleSignal();
    });
  }

  onCalculateHoliday() {
    if (!this.days) return;
    this.dateService.holidaysCount.set(Number(this.days));
    this.onClosePopup();
  }

  onClosePopup() {
        this.outputVisibleSignal.emit(false);

  }

  onOpenPopup() {
    this.visible = true;
  }
}
