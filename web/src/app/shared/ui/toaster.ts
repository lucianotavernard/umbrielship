import { Component, input, numberAttribute, signal } from '@angular/core';
import { NgxSonnerToaster, toast as nxgSonnerToast, type ToasterProps } from 'ngx-sonner';

export const toast = nxgSonnerToast;

@Component({
  selector: 'toaster',
  imports: [NgxSonnerToaster],
  template: `<ngx-sonner-toaster
    closeButton
    [theme]="theme()"
    [style]="style()"
    [position]="position()"
    [visibleToasts]="visibleToasts()"
  />`,
})
export class Toaster {
  theme = input<ToasterProps['theme']>('dark');
  position = input<ToasterProps['position']>('bottom-right');

  visibleToasts = input(3, { transform: numberAttribute });

  style = input<Record<string, string>>({
    '--normal-bg': 'var(--popover)',
    '--normal-text': 'var(--popover-foreground)',
    '--normal-border': 'var(--border)',
    '--border-radius': 'var(--radius)',
  });
}
