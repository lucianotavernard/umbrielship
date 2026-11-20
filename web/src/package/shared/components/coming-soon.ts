import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowLeft, lucideBell, lucideCircleUser, lucideHammer } from '@ng-icons/lucide';

/**
 * A page the user menu links to before it has content (AD-114): the page header of the app and a
 * card saying the feature is on its way. The route gives its words through `data`.
 */
@Component({
  selector: 'coming-soon',
  imports: [RouterLink, NgIcon],
  viewProviders: [provideIcons({ lucideArrowLeft, lucideBell, lucideCircleUser, lucideHammer })],
  template: `
    <div class="mx-auto w-full max-w-[1044px] px-[13px] pt-5 pb-[21px] sm:px-6 sm:pt-[25px] lg:px-[37px] lg:pt-[31px]">
      <div class="mb-[23px]">
        <div class="flex items-center gap-2 text-[9px] font-bold tracking-[1px] text-muted-foreground">
          <span class="h-px w-5 bg-muted-foreground/60"></span>
          {{ eyebrow() }}
        </div>
        <h1 class="mt-[9px] mb-[5px] text-[23px] leading-[1.2] font-normal tracking-[-0.7px] text-foreground sm:text-[25px]">
          {{ heading() }}
        </h1>
        <p class="text-[12px] text-muted-foreground">{{ description() }}</p>
      </div>

      <section
        data-slot="coming-soon"
        class="flex w-full flex-col items-center gap-2.5 rounded-lg border border-border bg-card px-7 py-[54px] text-center"
      >
        <span class="grid size-[45px] place-items-center rounded-[11px] bg-primary/10 text-primary">
          <ng-icon [name]="icon()" class="!size-[22px]" />
        </span>
        <h2 class="mt-1 text-[15px] font-normal text-foreground">Em breve</h2>
        <p class="max-w-[380px] text-[11px] text-muted-foreground">
          Esta área está em construção e estará disponível em uma próxima versão.
        </p>
        <a routerLink="/dashboard" class="mt-1 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary">
          <ng-icon name="lucideArrowLeft" class="!size-3.5" />
          Voltar para a visão geral
        </a>
      </section>
    </div>
  `,
})
export class ComingSoon {
  readonly eyebrow = input('');
  readonly heading = input('');
  readonly description = input('');
  readonly icon = input('lucideHammer');
}
