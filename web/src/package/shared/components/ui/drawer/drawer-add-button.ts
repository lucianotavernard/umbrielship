import { Directive } from '@angular/core';

/** The dashed "Adicionar …" button under a card's repeated blocks. */
@Directive({
  selector: 'button[tDrawerAdd]',
  host: {
    'data-slot': 'drawer-add',
    class:
      'flex h-[31px] w-fit items-center gap-[7px] rounded-[6px] border border-dashed border-primary/50 bg-primary/5 px-[11px] text-[10px] font-semibold text-primary hover:bg-primary/10 disabled:pointer-events-none disabled:opacity-50',
  },
})
export class DrawerAddButton {}
