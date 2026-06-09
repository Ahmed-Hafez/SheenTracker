import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'enumLabel', standalone: true })
export class EnumLabelPipe implements PipeTransform {
  transform(value: number, mapping: { value: number; label: string }[]): string {
    return mapping.find((item) => item.value === value)?.label ?? '—';
  }
}
