import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { MessageService } from 'primeng/api';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-delete-popup',
  standalone: true,
  imports: [DialogModule, ButtonModule, FloatLabelModule],
  templateUrl: './delete-popup.component.html',
})
export class DeletePopupComponent {
  constructor() {
    effect(() => {
      this.visible = this.inputVisibleSignal();
    });
  }
  private readonly messageService = inject(MessageService);
  inputVisibleSignal = input<boolean>(false);
  // The action function should be an observable that performs the delete operation when subscribed to
  action = input.required<Observable<any>>();
  title = input.required<string>();
  description = input.required<string>();
  outputVisibleSignal = output<boolean>();
  outputDeleteSignal = output<boolean>();
  isDeleteLoading = signal(false);
  visible = false;


  onSubmit() {
    this.isDeleteLoading.set(true);
    this.action()
      .subscribe({
        next: (res) => {
          this.isDeleteLoading.set(false);
          this.messageService.add({
            severity: 'success',
            summary: this.title() + ' Deleted',
            detail: this.title() + ' has been successfully deleted.',
          });
          this.visible = false;
          this.outputVisibleSignal.emit(false);
          this.outputDeleteSignal.emit(true);
        },
        error: (err) => {
          this.isDeleteLoading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error Deleting ' + this.title(),
            detail: 'An error occurred while deleting the ' + this.title() + '. Please try again.',
          });
        }
      });
  }
  onOpenPopup() {
    this.visible = true;
  }
  onClosePopup() {
    this.outputVisibleSignal.emit(false);
  }
}
