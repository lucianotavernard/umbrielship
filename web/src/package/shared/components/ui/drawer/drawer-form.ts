import { Directive, input } from '@angular/core';

/** The field style of the "Nova ordem de serviço" drawer, the drawer every form follows (AD-053). */
export const drawerFieldClass =
  'bg-card text-[11px] md:text-[11px] focus:border-ring/60 focus:ring-[3px] focus:ring-ring/15';

/** The label style of the drawer; red once its field is marked invalid. */
export const drawerLabelClass =
  'text-[10px] font-semibold [&:has(~[data-invalid])]:text-destructive';

/**
 * A form inside a drawer: its fields take the drawer style, and an invalid field turns red and shows
 * its message only once `shown` is true - the save button was used (AD-057).
 */
@Directive({
  selector: 'form[tDrawerForm]',
  host: {
    'data-slot': 'drawer-form',
    class: 'flex min-h-0 flex-1 flex-col',
  },
})
export class DrawerForm {
  /** True once the save button was used since the drawer opened. */
  readonly shown = input(false, { alias: 'tDrawerForm' });
}
