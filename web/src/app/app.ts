import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Toaster } from './shared/ui/toaster';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Toaster],
  template: `
    <router-outlet />
    <toaster />
  `,
})
export class App {}
