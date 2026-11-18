import { Directive } from '@angular/core';

/** The grey body of a drawer: its cards stack and it scrolls while the header and footer stay. */
@Directive({
  selector: 't-drawer-body',
  host: {
    'data-slot': 'drawer-body',
    class:
      'flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-y-contain bg-muted/60 px-[13px] py-[14px] sm:gap-[13px] sm:px-[25px] sm:py-[19px]',
  },
})
export class DrawerBody {}
