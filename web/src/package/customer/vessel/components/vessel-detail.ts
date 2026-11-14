import { Component, computed, input, output } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideShip, lucideTrash } from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { Vessel, vesselTypeLabels } from '../vessel.service';

@Component({
  selector: 'vessel-detail-ui',
  imports: [NgIcon, Button, Skeleton],
  viewProviders: [provideIcons({ lucideShip, lucidePencil, lucideTrash })],
  template: `
    <section class="rounded-lg border border-border p-6">
      <div class="flex items-start justify-between gap-6">
        @if (vessel(); as vessel) {
          <div class="flex-1">
            <div class="mb-4 flex items-center gap-3">
              <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <span class="text-sm font-semibold uppercase text-primary">{{ vessel.name.slice(0, 2) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-bold text-foreground">{{ vessel.name }}</h1>
                <span
                  class="inline-block rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground"
                >
                  {{ vesselType() }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="flex items-start gap-4 rounded-xl border bg-muted p-4">
                <div class="flex shrink-0 rounded-lg bg-background p-2.5 shadow-xs">
                  <ng-icon name="lucideShip" />
                </div>
                <div class="min-w-0 flex-1">
                  <p class="mb-1 text-xs font-semibold uppercase tracking-wider">
                    Detalhes da Embarcação
                  </p>
                  <p class="mt-0.5 text-xs text-muted-foreground">
                    IMO {{ vessel.imoNumber }}, {{ vessel.length }}
                    {{ vessel.length === 1 ? 'metro' : 'metros' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-2">
            <button tButton type="button" size="sm" class="gap-2" (click)="edited.emit()">
              <ng-icon name="lucidePencil" />
              Editar
            </button>
            <button tButton type="button" variant="destructive" size="sm" class="gap-2" disabled>
              <ng-icon name="lucideTrash" />
              Deletar
            </button>
          </div>
        } @else {
          <div class="grid gap-2">
            <t-skeleton class="h-7 w-56 rounded" />
            <t-skeleton class="h-4 w-40 rounded" />
          </div>
        }
      </div>
    </section>
  `,
})
export class VesselDetail {
  vessel = input<Vessel | null>(null);
  edited = output<void>();

  vesselType = computed(() => vesselTypeLabels[this.vessel()?.type ?? 'CARGO']);
}
