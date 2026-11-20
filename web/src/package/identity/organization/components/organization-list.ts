import { Component, computed, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideTrash2 } from '@ng-icons/lucide';

import { initials } from '../../../shared/components/lib/initials';
import { Button } from '../../../shared/components/ui/button';
import { Checkbox } from '../../../shared/components/ui/form';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { OrganizationListItem } from '../organization.service';

// The tones of the vessel and staff avatars: blue, green, purple and amber, in turn.
const TONES = [
  'bg-[#edf3fa] text-[#5889bc] dark:bg-[#18283a] dark:text-[#8db4dc]',
  'bg-[#eaf5f1] text-[#4f917b] dark:bg-[#17302f] dark:text-[#7cc7c2]',
  'bg-[#f4eff8] text-[#9275a6] dark:bg-[#271f33] dark:text-[#c3a8e6]',
  'bg-[#fbf3e6] text-[#b0803a] dark:bg-[#2e2516] dark:text-[#e0b76f]',
];

/**
 * The "Organizações" table after "Lista de embarcações" (AD-111): a checkbox, the Organization with
 * its email, its type and up to four members. A row opens the Organization; "Excluir" shows on its
 * hover. The internal Organization can be neither selected nor deleted (AD-110).
 */
@Component({
  selector: 'organization-list-ui',
  imports: [NgIcon, Button, Checkbox, Skeleton],
  viewProviders: [provideIcons({ lucideTrash2 })],
  template: `
    <div class="relative mt-[14px] overflow-x-auto">
      <table class="w-full min-w-[640px] border-collapse text-left whitespace-nowrap">
        <thead class="h-[35px]">
          <tr class="text-[8px] font-bold tracking-[0.65px] text-muted-foreground">
            <th class="w-9 pr-2 text-center">
              <input
                type="checkbox"
                tCheckbox
                aria-label="Selecionar todas as organizações visíveis"
                [checked]="allSelected()"
                [indeterminate]="someSelected()"
                [disabled]="loading() || deletable().length === 0"
                (change)="toggledAll.emit()"
              />
            </th>
            <th class="font-bold">ORGANIZAÇÃO</th>
            <th class="font-bold">TIPO</th>
            <th class="font-bold">MEMBROS</th>
            <th><span class="sr-only">Ações</span></th>
          </tr>
        </thead>
        <tbody>
          @if (loading()) {
            @for (row of [1, 2, 3]; track row) {
              <tr data-slot="skeleton-row" class="h-[62px] border-t border-border">
                <td></td>
                <td>
                  <div class="flex items-center gap-[9px]">
                    <t-skeleton class="size-[33px] rounded-[9px]" />
                    <div class="grid gap-1.5">
                      <t-skeleton class="h-3 w-36 rounded" />
                      <t-skeleton class="h-2.5 w-28 rounded" />
                    </div>
                  </div>
                </td>
                <td><t-skeleton class="h-5 w-16 rounded-full" /></td>
                <td><t-skeleton class="h-6 w-24 rounded-full" /></td>
                <td></td>
              </tr>
            }
          } @else {
            @for (organization of rows(); track organization.id; let index = $index) {
              <tr
                data-slot="organization-row"
                tabindex="0"
                class="group h-[62px] cursor-pointer border-t border-border text-[10px] text-muted-foreground outline-none hover:bg-muted/40 focus-visible:bg-muted/40 data-[selected]:bg-primary/5"
                [attr.data-selected]="selected().has(organization.id) ? '' : null"
                (click)="open(organization)"
                (keydown.enter)="open(organization)"
              >
                <!-- The checkbox and the actions keep their own clicks: neither opens the Organization. -->
                <td class="w-9 pr-2 text-center" (click)="$event.stopPropagation()">
                  <input
                    type="checkbox"
                    tCheckbox
                    [attr.aria-label]="'Selecionar organização ' + organization.name"
                    [checked]="selected().has(organization.id)"
                    [disabled]="organization.isInternal"
                    (change)="toggled.emit(organization)"
                  />
                </td>
                <td>
                  <div class="flex items-center gap-2.5">
                    <span
                      aria-hidden="true"
                      class="grid size-[33px] shrink-0 place-items-center rounded-[9px] text-[9px] font-bold"
                      [class]="tones[index % tones.length]"
                    >
                      {{ initialsOf(organization.name) }}
                    </span>
                    <span class="min-w-0">
                      <span data-slot="organization-name" class="block max-w-[260px] truncate font-semibold text-foreground">{{
                        organization.name
                      }}</span>
                      <small data-slot="organization-email" class="mt-1 block max-w-[260px] truncate text-[9px] text-muted-foreground">{{
                        organization.email
                      }}</small>
                    </span>
                  </div>
                </td>
                <td>
                  <span
                    data-slot="organization-type"
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-[8px] font-bold"
                    [class]="
                      organization.isInternal
                        ? 'bg-[#e8eff7] text-[#3f6b96] dark:bg-[#18283a] dark:text-[#8db4dc]'
                        : 'bg-muted text-muted-foreground'
                    "
                  >
                    {{ organization.isInternal ? 'Interna' : 'Externa' }}
                  </span>
                </td>
                <td>
                  @if (organization.memberCount === 0) {
                    <span data-slot="organization-members" class="text-[9px]">Sem membros</span>
                  } @else {
                    <span
                      data-slot="organization-members"
                      class="flex items-center"
                      [attr.aria-label]="membersLabel(organization)"
                    >
                      @for (member of organization.members; track member.id; let position = $index) {
                        <span
                          aria-hidden="true"
                          class="-ml-1.5 grid size-[26px] place-items-center rounded-full text-[8px] font-bold ring-2 ring-card first:ml-0"
                          [class]="tones[position % tones.length]"
                          [attr.title]="member.name"
                          >{{ initialsOf(member.name) }}</span
                        >
                      }
                      @if (organization.memberCount > organization.members.length) {
                        <span
                          aria-hidden="true"
                          class="-ml-1.5 grid size-[26px] place-items-center rounded-full bg-muted text-[8px] font-bold text-muted-foreground ring-2 ring-card"
                          >+{{ organization.memberCount - organization.members.length }}</span
                        >
                      }
                    </span>
                  }
                </td>
                <td data-slot="row-actions" class="pr-3 pl-2" (click)="$event.stopPropagation()">
                  @if (!organization.isInternal) {
                    <!-- Shown on the row's hover or focus, and always where there is no hover. -->
                    <div
                      class="flex justify-end opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100"
                    >
                      <button
                        tButton
                        variant="ghost"
                        size="icon-sm"
                        type="button"
                        class="size-[27px] rounded-[5px] text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
                        [attr.aria-label]="'Excluir organização ' + organization.name"
                        (click)="deleted.emit(organization)"
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
      @if (!loading() && rows().length === 0) {
        <div data-slot="empty" class="p-[25px] text-center text-[11px] text-muted-foreground">
          Nenhuma organização encontrada.
        </div>
      }
    </div>
  `,
})
export class OrganizationList {
  private readonly router = inject(Router);

  loading = input(true);
  /** The page of Organizations the API answered for the search. */
  rows = input<OrganizationListItem[]>([]);
  selected = input<ReadonlySet<string>>(new Set());

  toggled = output<OrganizationListItem>();
  toggledAll = output<void>();
  deleted = output<OrganizationListItem>();

  protected readonly tones = TONES;
  protected readonly initialsOf = initials;

  /** The rows that may be selected: every one but the internal Organization. */
  protected readonly deletable = computed(() => this.rows().filter((row) => !row.isInternal));
  protected readonly allSelected = computed(
    () => this.deletable().length > 0 && this.deletable().every((row) => this.selected().has(row.id)),
  );
  protected readonly someSelected = computed(
    () => !this.allSelected() && this.deletable().some((row) => this.selected().has(row.id)),
  );

  protected membersLabel(organization: OrganizationListItem) {
    const names = organization.members.map((member) => member.name).join(', ');
    const rest = organization.memberCount - organization.members.length;
    return rest > 0 ? `${names} e mais ${rest}` : names;
  }

  /** A row opens its Organization. */
  protected open(organization: OrganizationListItem) {
    void this.router.navigate(['/organizations', organization.id]);
  }
}
