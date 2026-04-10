import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Button } from '@/shared/ui/button';

@Component({
  selector: 'not-found',
  imports: [RouterLink, Button],
  template: `
    <div class="flex flex-col items-center justify-center h-screen text-center">
      <p class="text-base font-semibold text-primary">404</p>
      <h1
        class="leading-tighter max-w-3xl text-3xl font-semibold tracking-tight text-balance text-primary lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter"
      >
        Página não encontrada
      </h1>
      <p class="mt-6 text-lg text-muted-foreground">
        Desculpe, não encontramos a página que você está procurando.
      </p>
      <a class="mt-6" routerLink="/dashboard">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-4"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        Voltar para o Dashboard
      </a>
    </div>
  `,
})
export class NotFound {}
