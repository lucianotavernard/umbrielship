import { Component, computed, input, output } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideMail, lucidePhone, lucidePencil, lucideTrash } from '@ng-icons/lucide';

import { Button } from '../../../shared/components/ui/button';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { Customer } from '../customer.service';

@Component({
  selector: 'customer-detail-ui',
  imports: [NgIcon, Button, Skeleton],
  viewProviders: [provideIcons({ lucideMail, lucidePhone, lucidePencil, lucideTrash })],
  template: `
    <section class="rounded-lg border border-border p-6">
      @if (customer(); as customer) {
        <div class="flex flex-col gap-6">
          <!-- Header Section -->
          <header class="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <section class="flex items-center justify-between gap-6 w-full">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-4">
                  <!-- Avatar -->
                  <div class="flex items-center justify-center size-12 rounded-lg bg-muted">
                    <span class="text-sm font-semibold text-primary">
                      {{ initialsName() }}
                    </span>
                  </div>

                  <!-- Title -->
                  <div>
                    <h1 class="text-2xl font-bold text-foreground">
                      {{ customer.name }}
                    </h1>
                    <p class="text-sm text-muted-foreground flex items-center gap-1">
                      <ng-icon name="lucideMail" class="!size-4 mr-1" />
                      <a class="hover:underline" [href]="'mailto:' + customer.email">{{ customer.email }}</a>
                    </p>
                  </div>
                </div>
              </div>

              @if (canWrite()) {
              <div class="flex gap-2">
                <button tButton type="button" size="sm" class="gap-2" (click)="edited.emit()">
                  <ng-icon name="lucidePencil" class="!size-4" />
                  Editar
                </button>
                <button
                  tButton
                  type="button"
                  variant="destructive"
                  size="sm"
                  class="gap-2"
                  disabled
                >
                  <ng-icon name="lucideTrash" class="!size-4" />
                  Deletar
                </button>
              </div>
              }
            </section>
          </header>

          <!-- Info Cards -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Contact Card -->
            <div class="flex items-start gap-4 p-4 rounded-xl bg-border border">
              <div class="flex flex-shrink-0 p-2.5 bg-background rounded-lg shadow-xs">
                <ng-icon name="lucidePhone" class="!size-5" />
              </div>

              <div class="min-w-0 flex-1">
                <p class="text-xs font-semibold uppercase tracking-wider mb-1">
                  Contato
                </p>
                <p class="text-sm font-medium text-muted-foreground">{{ phoneNumber() }}</p>
              </div>
            </div>

            <!-- Address Card -->
            @if (customer.address) {
              <div class="flex items-start gap-4 p-4 rounded-xl bg-background border">
                <div class="flex flex-shrink-0 p-2.5 bg-muted rounded-lg shadow-xs">
                  <ng-icon name="lucideMapPin" class="!size-5" />
                </div>

                <div class="min-w-0 flex-1">
                  <p class="text-xs font-semibold uppercase tracking-wider mb-1">Endereço</p>
                  <p class="text-sm font-medium text-muted-foreground truncate">
                    {{ customer.address.address }}
                    @if (customer.address.city) {
                      {{ customer.address.city }}
                    @if (customer.address.state) {
                      , {{ customer.address.state }}
                    }
                    }
                  </p>
                </div>
              </div>
            }
          </div>
        </div>
      } @else {
        <div class="grid gap-2">
          <t-skeleton class="h-7 w-56 rounded" />
          <t-skeleton class="h-4 w-40 rounded" />
        </div>
      }
    </section>
  `,
})
export class CustomerDetail {
  canWrite = input.required<boolean>();
  customer = input<Customer | null>(null);
  edited = output<void>();

  initialsName = computed(
    () =>
      this.customer()
        ?.name.split(' ')
        .map((name) => name.charAt(0))
        .join('') ?? '',
  );

  phoneNumber = computed(() =>
    this.customer()?.phone?.replace(/(\d{2})(\d{1})(\d{4})(\d{4})/, '($1) $2 $3-$4'),
  );
}
