import { Component, input, output } from '@angular/core';

@Component({
  selector: 'service-image-upload-ui',
  template: `
    <input type="file" aria-label="Enviar foto" (change)="onFile($event)" />
  `,
})
export class ServiceImageUpload {
  serviceId = input.required<string>();
  selected = output<File>();

  onFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.selected.emit(file);
  }
}
