import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Button } from '@/shared/ui/button';

@Component({
  selector: 'forbidden',
  imports: [RouterLink, Button],
  template: `
    <div class="flex flex-col items-center justify-center h-screen text-center">
      <p class="text-base font-semibold text-primary">403</p>
      <h1 class="leading-tighter max-w-3xl text-3xl font-semibold tracking-tight text-balance text-primary lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter">
        Acesso negado
      </h1>
      <p class="mt-6 text-lg text-gray-700">Desculpe, você não tem permissão para acessar esta página.</p>
      <a class="mt-6" variant="link" routerLink="/dashboard">Voltar para o Dashboard</a>
    </div>
  `,
})
export class Forbidden {}
