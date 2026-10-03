import { CanDeactivateFn } from '@angular/router';

/** A routed component that can hold edits the user hasn't saved yet. */
export interface HasUnsavedChanges {
  hasUnsavedChanges(): boolean;
  /** Asks the user; resolves true when they choose to discard their edits. */
  confirmDiscard(): Promise<boolean>;
}

/** Stops in-app navigation away from unsaved edits until the user confirms. */
export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) =>
  component.hasUnsavedChanges() ? component.confirmDiscard() : true;
