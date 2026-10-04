import { ChangeDetectionStrategy, Component, inject, input, linkedSignal, output, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-delete-popup',
  imports: [DialogModule],
  templateUrl: './delete-popup.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeletePopupComponent {
  private readonly messageService = inject(MessageService);

  inputVisibleSignal = input<boolean>(false);
  /** Observable that performs the delete when subscribed to. */
  action = input.required<Observable<unknown>>();
  title = input.required<string>();
  description = input.required<string>();
  outputVisibleSignal = output<boolean>();
  outputDeleteSignal = output<boolean>();

  isDeleteLoading = signal(false);
  readonly visible = linkedSignal(() => this.inputVisibleSignal());

  onSubmit() {
    this.isDeleteLoading.set(true);
    // Failures are reported by the error interceptor with the server's reason.
    this.action().subscribe({
      next: () => {
        this.isDeleteLoading.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Deleted',
          detail: `${this.title()} has been deleted.`,
        });
        this.visible.set(false);
        this.outputVisibleSignal.emit(false);
        this.outputDeleteSignal.emit(true);
      },
      error: () => this.isDeleteLoading.set(false),
    });
  }

  onClosePopup() {
    this.visible.set(false);
    this.outputVisibleSignal.emit(false);
  }
}
