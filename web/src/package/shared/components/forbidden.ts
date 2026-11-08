import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Button } from './ui/button';

@Component({
  selector: 'forbidden',
  imports: [RouterLink, Button],
  template: `
    <div class="flex h-screen flex-col items-center justify-center text-center">
      <p class="text-base font-semibold text-primary">403</p>
      <h1 class="text-3xl font-semibold">Acesso negado</h1>
      <p class="mt-6 text-lg">Desculpe, você não tem permissão para acessar esta página.</p>
      <a tButton class="mt-6" variant="link" routerLink="/dashboard">Voltar para o Dashboard</a>
    </div>
  `,
})
export class Forbidden {}
