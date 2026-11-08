import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Button } from './ui/button';

@Component({
  selector: 'not-found',
  imports: [RouterLink, Button],
  template: `
    <div class="flex h-screen flex-col items-center justify-center text-center">
      <p class="text-base font-semibold text-primary">404</p>
      <h1 class="text-3xl font-semibold">Página não encontrada</h1>
      <a tButton class="mt-6" variant="link" routerLink="/dashboard">Voltar para o Dashboard</a>
    </div>
  `,
})
export class NotFound {}
