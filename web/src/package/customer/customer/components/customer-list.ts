import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideMail,
  lucideMapPin,
  lucidePencil,
  lucidePhone,
  lucideShip,
  lucideTrash2,
} from '@ng-icons/lucide';

import { initials } from '../../../shared/components/lib/initials';
import { Button } from '../../../shared/components/ui/button';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { CustomerListItem } from '../customer.service';

/**
 * The mareos "Lista de clientes" table. The page sorts and filters; this draws the rows. A row opens
 * its Customer; "Editar" and "Excluir" show on the row's hover (AD-103).
 */
@Component({
  selector: 'customer-list-ui',
  imports: [NgIcon, Button, Skeleton],
  viewProviders: [
    provideIcons({
      lucideMail,
      lucideMapPin,
      lucidePencil,
      lucidePhone,
      lucideShip,
      lucideTrash2,
    }),
  ],
  template: `
    <div class="relative mt-[15px] overflow-x-auto">
      <table class="w-full min-w-[850px] border-collapse text-left whitespace-nowrap">
        <thead class="h-[35px]">
          <tr class="text-[8px] font-bold tracking-[0.65px] text-muted-foreground">
            <th class="font-bold">CLIENTE</th>
            <th class="font-bold">CONTATO</th>
            <th class="font-bold">LOCALIZAÇÃO</th>
            <th class="font-bold">EMBARCAÇÕES</th>
            <th><span class="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            @for (row of [1, 2, 3]; track row) {
              <tr data-slot="skeleton-row" class="h-[68px] border-t border-border">
                <td>
                  <div class="flex items-center gap-2.5">
                    <t-skeleton class="size-[35px] rounded-lg" />
                    <div class="grid gap-1.5">
                      <t-skeleton class="h-3 w-36 rounded" />
                      <t-skeleton class="h-2.5 w-28 rounded" />
                    </div>
                  </div>
                </td>
                <td><t-skeleton class="h-3 w-40 rounded" /></td>
                <td><t-skeleton class="h-3 w-24 rounded" /></td>
                <td><t-skeleton class="h-3 w-20 rounded" /></td>
                <td><t-skeleton class="ml-auto size-[29px] rounded-md" /></td>
              </tr>
            }
          } @else {
            @for (customer of customers(); track customer.id) {
              <tr
                data-slot="customer-row"
                tabindex="0"
                class="group h-[68px] cursor-pointer border-t border-border text-[10px] text-muted-foreground outline-none hover:bg-muted/40 focus-visible:bg-muted/40"
                (click)="open(customer)"
                (keydown.enter)="open(customer)"
              >
                <td>
                  <div class="flex min-w-[190px] items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      data-slot="initials"
                      class="grid size-[35px] shrink-0 place-items-center rounded-lg bg-[#e8f3f3] text-[10px] font-bold text-[#408384] dark:bg-[#17302f] dark:text-[#7cc7c2]"
                    >
                      {{ initialsOf(customer.name) }}
                    </span>
                    <span class="min-w-0">
                      <span data-slot="customer-name" class="block max-w-[220px] truncate text-[10px] font-semibold text-foreground">
                        {{ customer.name }}
                      </span>
                      <small data-slot="street" class="mt-1 block max-w-[220px] truncate text-[9px] text-muted-foreground">
                        {{ customer.address.address || 'Endereço não informado' }}
                      </small>
                    </span>
                  </div>
                </td>
                <td>
                  <div class="grid gap-[5px] text-[9px]">
                    <span data-slot="email" class="flex items-center gap-1.5">
                      <ng-icon name="lucideMail" class="!size-[13px] shrink-0" />{{ customer.email || 'E-mail não informado' }}
                    </span>
                    <span data-slot="phone" class="flex items-center gap-1.5">
                      <ng-icon name="lucidePhone" class="!size-[13px] shrink-0" />{{ customer.phone || 'Telefone não informado' }}
                    </span>
                  </div>
                </td>
                <td>
                  <span data-slot="location" class="flex items-center gap-1.5 text-[9px]">
                    <ng-icon name="lucideMapPin" class="!size-[13px] shrink-0" />{{ location(customer) }}
                  </span>
                </td>
                <td>
                  <span data-slot="vessel-count" class="flex items-center gap-1.5 text-[9px] text-foreground/75">
                    <ng-icon name="lucideShip" class="!size-3.5 shrink-0" />{{ customer.vesselCount }}
                    {{ customer.vesselCount === 1 ? 'embarcação' : 'embarcações' }}
                  </span>
                </td>
                <!-- The actions keep their own clicks: they do not open the Customer. -->
                <td data-slot="row-actions" class="pr-3" (click)="$event.stopPropagation()">
                  @if (canWrite()) {
                    <!-- Shown on the row's hover or focus, and always where there is no hover. -->
                    <div
                      class="flex justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100"
                    >
                      <button
                        tButton
                        variant="ghost"
                        size="icon-sm"
                        type="button"
                        class="size-[27px] rounded-[5px] text-muted-foreground hover:text-primary"
                        [attr.aria-label]="'Editar ' + customer.name"
                        (click)="edited.emit(customer)"
                      >
                        <ng-icon name="lucidePencil" class="!size-3.5" />
                        <span class="sr-only">Editar</span>
                      </button>
                      <button
                        tButton
                        variant="ghost"
                        size="icon-sm"
                        type="button"
                        class="size-[27px] rounded-[5px] text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
                        [attr.aria-label]="'Excluir ' + customer.name"
                        (click)="deleted.emit(customer)"
                      >
                        <ng-icon name="lucideTrash2" class="!size-3.5" />
                        <span class="sr-only">Excluir</span>
                      </button>
                    </div>
                  }
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
      @if (!loading() && customers().length === 0) {
        <div data-slot="empty" class="p-[25px] text-center text-[11px] text-muted-foreground">
          {{ total() ? 'Nenhum cliente encontrado para essa busca.' : 'Ainda não há clientes cadastrados.' }}
        </div>
      }
    </div>
  `,
})
export class CustomerList {
  canWrite = input.required<boolean>();
  loading = input(true);
  /** The rows to draw: already sorted and searched. */
  customers = input<CustomerListItem[]>([]);
  /** How many Customers the Organization has, whatever the search. */
  total = input(0);

  edited = output<CustomerListItem>();
  deleted = output<CustomerListItem>();

  private readonly router = inject(Router);

  protected readonly initialsOf = initials;

  /** A row opens its Customer (AD-103). */
  protected open(customer: CustomerListItem) {
    void this.router.navigate(['/customers', customer.id]);
  }

  protected location(customer: CustomerListItem) {
    const { city, state } = customer.address;
    if (!city) return 'Localização não informada';
    return state ? `${city}, ${state}` : city;
  }
}
