import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Toaster } from './package/shared/components/ui/toaster';

@Component({
  selector: 't-app',
  imports: [RouterOutlet, Toaster],
  template: `
    <router-outlet />
    <t-toaster />
  `,
})
export class App {}
