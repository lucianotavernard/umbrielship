import { httpResource, HttpStatusCode } from '@angular/common/http';
import { Component, computed, effect, input, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideArrowUpRight,
  lucideBriefcaseBusiness,
  lucideMail,
  lucidePhone,
  lucideShieldCheck,
  lucideUsers,
  lucideWrench,
} from '@ng-icons/lucide';

import { GetVesselsResponse } from '../../../customer/vessel/vessel.service';
import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { initials } from '../../../shared/components/lib/initials';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { toast } from '../../../shared/components/ui/toaster';
import { GetWorkOrdersResponse } from '../../../work-order/work-order/work-order.service';
import { openAllocations } from '../staff-allocations';
import { NO_TEAM } from '../staff-filters';
import { servicesInProgress, staffStatus, statusTones } from '../staff-status';
import { GetAssignmentsResponse, GetStaffResponse, GetTeamsResponse } from '../staff.service';

const card = 'rounded-lg border border-border bg-card';

/** The mareos professional profile, with the open services it answers for (AD-071). */
@Component({
  selector: 'staff-detail',
  imports: [NgIcon, RouterLink, Skeleton],
  viewProviders: [
    provideIcons({
      lucideArrowLeft,
      lucideArrowUpRight,
      lucideBriefcaseBusiness,
      lucideMail,
      lucidePhone,
      lucideShieldCheck,
      lucideUsers,
      lucideWrench,
    }),
  ],
  template: `
    <div class="mx-auto w-full max-w-[560px] px-[13px] pt-5 pb-[21px] sm:px-6 sm:pt-[31px]">
      @if (notFound()) {
        <section
          data-slot="not-found"
          [class]="card + ' mx-auto grid max-w-[300px] justify-items-center px-5 py-[54px] text-center'"
        >
          <span
            class="grid size-[42px] place-items-center rounded-[11px] bg-[#edf4f4] text-[#238c82] dark:bg-[#17302f] dark:text-[#7cc7c2]"
          >
            <ng-icon name="lucideUsers" class="!size-5" />
          </span>
          <h1 class="mt-[14px] mb-[5px] text-[19px] font-normal text-foreground">Profissional não encontrado</h1>
          <p class="mb-4 text-[11px] text-muted-foreground">Este cadastro não está disponível na equipe técnica.</p>
          <a class="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary" routerLink="/staff">
            <ng-icon name="lucideArrowLeft" class="!size-[15px]" />
            Voltar para a equipe
          </a>
        </section>
      } @else if (staff(); as person) {
        <nav aria-label="Navegação estrutural" class="mb-4 flex items-center gap-2 text-[10px] text-muted-foreground">
          <a class="flex items-center gap-1.5 hover:text-foreground" routerLink="/staff">
            <ng-icon name="lucideArrowLeft" class="!size-[15px]" />
            Equipe técnica
          </a>
          <span>/</span>
          <strong class="font-semibold text-foreground">{{ person.name }}</strong>
        </nav>

        <section aria-labelledby="staff-title" [class]="card + ' mb-4 flex items-center gap-4 px-6 py-7'">
          <span
            aria-hidden="true"
            class="grid size-[58px] shrink-0 place-items-center rounded-[15px] bg-[#e8f5f3] text-[16px] font-bold text-[#287f76] dark:bg-[#17302f] dark:text-[#7cc7c2]"
          >
            {{ initialsOf(person.name) }}
          </span>
          <div class="min-w-0 flex-1">
            <span class="text-[8px] font-bold tracking-[1px] text-primary">PERFIL PROFISSIONAL</span>
            <h1 id="staff-title" class="mt-1 text-[24px] leading-tight font-normal tracking-[-0.6px] text-foreground">
              {{ person.name }}
            </h1>
            <p class="mt-1 text-[11px] text-muted-foreground">{{ person.specialty }}</p>
          </div>
          <span
            data-slot="profile-status"
            class="inline-flex items-center gap-1.5 self-center rounded-full px-2.5 py-1.5 text-[8px] font-bold"
            [class]="tones[status()]"
          >
            <i class="size-[5px] rounded-full bg-current" aria-hidden="true"></i>{{ status() }}
          </span>
        </section>

        <section aria-label="Resumo profissional" class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <article [class]="card + ' flex items-center gap-3 px-4 py-[18px]'">
            <span class="grid size-[34px] shrink-0 place-items-center rounded-lg bg-[#edf3fa] text-[#5e8bb5] dark:bg-[#18283a] dark:text-[#8db4dc]">
              <ng-icon name="lucideWrench" class="!size-[17px]" />
            </span>
            <div class="min-w-0">
              <small class="block text-[8px] text-muted-foreground">Especialidade</small>
              <strong data-slot="profile-specialty" class="mt-1 block truncate text-[10px] text-foreground">{{ person.specialty }}</strong>
            </div>
          </article>
          <article [class]="card + ' flex items-center gap-3 px-4 py-[18px]'">
            <span class="grid size-[34px] shrink-0 place-items-center rounded-lg bg-[#e9f3f3] text-[#4b9295] dark:bg-[#17302f] dark:text-[#7cc7c2]">
              <ng-icon name="lucideUsers" class="!size-[17px]" />
            </span>
            <div class="min-w-0">
              <small class="block text-[8px] text-muted-foreground">Equipe vinculada</small>
              <strong data-slot="profile-team" class="mt-1 block truncate text-[10px] text-foreground">{{ teamName() }}</strong>
            </div>
          </article>
          <article [class]="card + ' flex items-center gap-3 px-4 py-[18px]'">
            <span class="grid size-[34px] shrink-0 place-items-center rounded-lg bg-[#eaf5ef] text-[#498b68] dark:bg-[#15291f] dark:text-[#8fcfab]">
              <ng-icon name="lucideShieldCheck" class="!size-[17px]" />
            </span>
            <div class="min-w-0">
              <small class="block text-[8px] text-muted-foreground">Situação atual</small>
              <strong data-slot="profile-situation" class="mt-1 block truncate text-[10px] text-foreground">{{ status() }}</strong>
            </div>
          </article>
        </section>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <section aria-labelledby="contact-title" [class]="card + ' px-[18px] py-[18px]'">
            <header class="flex items-start gap-3 border-b border-border pb-4">
              <span class="grid size-[30px] shrink-0 place-items-center rounded-lg bg-[#edf3fa] text-[#5e8bb5] dark:bg-[#18283a] dark:text-[#8db4dc]">
                <ng-icon name="lucideBriefcaseBusiness" class="!size-4" />
              </span>
              <div>
                <h2 id="contact-title" class="text-[12px] font-normal text-foreground">Contato profissional</h2>
                <p class="mt-1 text-[9px] text-muted-foreground">Informações para comunicação direta.</p>
              </div>
            </header>
            <dl class="grid gap-0 text-[9px]">
              <div class="flex items-center justify-between gap-3 border-b border-border py-[15px]">
                <dt class="flex items-center gap-1.5 text-muted-foreground"><ng-icon name="lucideMail" class="!size-3.5" /> E-mail</dt>
                <dd>
                  <a data-slot="profile-email" class="flex items-center gap-1 text-foreground hover:text-primary" [href]="'mailto:' + person.email">
                    {{ person.email }}<ng-icon name="lucideArrowUpRight" class="!size-[13px]" />
                  </a>
                </dd>
              </div>
              <div class="flex items-center justify-between gap-3 py-[15px]">
                <dt class="flex items-center gap-1.5 text-muted-foreground"><ng-icon name="lucidePhone" class="!size-3.5" /> Telefone</dt>
                <dd>
                  <a data-slot="profile-phone" class="flex items-center gap-1 text-foreground hover:text-primary" [href]="'tel:' + dial()">
                    {{ person.phone }}<ng-icon name="lucideArrowUpRight" class="!size-[13px]" />
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          <section aria-labelledby="allocation-title" [class]="card + ' px-[18px] py-[18px]'">
            <header class="flex items-start gap-3 pb-4">
              <span class="grid size-[30px] shrink-0 place-items-center rounded-lg bg-[#e9f3f3] text-[#4b9295] dark:bg-[#17302f] dark:text-[#7cc7c2]">
                <ng-icon name="lucideUsers" class="!size-4" />
              </span>
              <div>
                <h2 id="allocation-title" class="text-[12px] font-normal text-foreground">Alocação na oficina</h2>
                <p class="mt-1 text-[9px] text-muted-foreground">Vínculo atual do profissional.</p>
              </div>
            </header>
            <div class="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-3">
              <span class="grid size-[34px] shrink-0 place-items-center rounded-lg bg-[#e9f3f3] text-[#4b9295] dark:bg-[#17302f] dark:text-[#7cc7c2]">
                <ng-icon name="lucideUsers" class="!size-[18px]" />
              </span>
              <div class="min-w-0 flex-1">
                <strong class="block truncate text-[10px] text-foreground">{{ teamName() }}</strong>
                <span class="text-[8px] text-muted-foreground">Equipe técnica</span>
              </div>
              <span
                data-slot="allocation-status"
                class="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[8px] font-bold"
                [class]="tones[status()]"
              >
                <i class="size-[5px] rounded-full bg-current" aria-hidden="true"></i>{{ status() }}
              </span>
            </div>

            <ul data-slot="allocations" class="mt-3 grid gap-2">
              @if (loadingAllocations()) {
                <li><t-skeleton class="h-10 w-full rounded-lg" /></li>
              } @else {
                @for (allocation of allocations(); track allocation.workOrderId + allocation.serviceName + allocation.startsAt) {
                  <li>
                    <a
                      data-slot="allocation"
                      class="block rounded-lg border border-border px-3 py-2 hover:border-primary/40"
                      [routerLink]="['/work-orders', allocation.workOrderId]"
                    >
                      <strong class="block text-[10px] text-foreground">{{ allocation.serviceName }}</strong>
                      <span class="mt-0.5 block text-[9px] text-muted-foreground">
                        {{ allocation.code }} · {{ allocation.vesselName }} · {{ allocation.period }}
                      </span>
                    </a>
                  </li>
                } @empty {
                  <li data-slot="no-allocation" class="py-2 text-[9px] text-muted-foreground">Nenhuma alocação em serviços abertos.</li>
                }
              }
            </ul>

            <a class="mt-4 flex items-center gap-1.5 text-[9px] text-muted-foreground hover:text-foreground" routerLink="/staff">
              <ng-icon name="lucideArrowLeft" class="!size-3.5" />
              Voltar à lista da equipe
            </a>
          </section>
        </div>
      } @else {
        <t-skeleton data-slot="profile-skeleton" class="h-[118px] w-full rounded-lg" />
      }
    </div>
  `,
})
export class StaffDetail {
  id = input.required<string>();

  staffResource = httpResource<GetStaffResponse>(() => `/api/staff/${this.id()}`);
  teamResource = httpResource<GetTeamsResponse>(() => '/api/teams');
  assignmentResource = httpResource<GetAssignmentsResponse>(() => '/api/assignments');
  workOrderResource = httpResource<GetWorkOrdersResponse>(() => '/api/work-orders');
  vesselResource = httpResource<GetVesselsResponse>(() => '/api/vessels');

  protected readonly card = card;
  protected readonly tones = statusTones;
  protected readonly initialsOf = initials;

  staff = computed(() => resourceValue(this.staffResource)?.staff ?? null);
  notFound = computed(
    () => (this.staffResource.error() as { status?: number } | undefined)?.status === HttpStatusCode.NotFound,
  );

  private readonly assignments = computed(() => resourceValue(this.assignmentResource)?.assignments ?? []);
  private readonly workOrders = computed(() => resourceValue(this.workOrderResource)?.workOrders ?? []);
  private readonly inProgress = computed(() => servicesInProgress(this.workOrders()));

  private readonly team = computed(() => {
    const teamId = this.staff()?.teamId;
    return teamId ? ((resourceValue(this.teamResource)?.teams ?? []).find((team) => team.id === teamId) ?? null) : null;
  });

  teamName = computed(() => this.team()?.name ?? NO_TEAM);

  status = computed(() => {
    const staff = this.staff();
    return staff ? staffStatus(staff, this.assignments(), this.inProgress()) : 'Disponível';
  });

  /** Only digits and "+" in the `tel:` link. */
  dial = computed(() => (this.staff()?.phone ?? '').replace(/[^\d+]/g, ''));

  loadingAllocations = computed(
    () =>
      this.assignmentResource.isLoading() || this.workOrderResource.isLoading() || this.vesselResource.isLoading(),
  );

  allocations = computed(() => {
    const staff = this.staff();
    if (!staff) return [];
    const vesselNames = new Map(
      (resourceValue(this.vesselResource)?.vessels ?? []).map((vessel) => [vessel.id, vessel.name]),
    );
    return openAllocations(staff, this.assignments(), this.workOrders(), vesselNames);
  });

  constructor() {
    effect(() => {
      const failed = [this.teamResource, this.assignmentResource, this.workOrderResource, this.vesselResource]
        .map((resource) => resource.error())
        .find(Boolean);
      const staffError = this.staffResource.error() as { status?: number } | undefined;
      const error = failed ?? (staffError && staffError.status !== HttpStatusCode.NotFound ? staffError : undefined);
      if (!error) return;
      untracked(() =>
        toast.error('Erro ao carregar a equipe técnica', {
          description: apiErrorMessage(error as { error?: unknown }, 'Não foi possível carregar a equipe técnica.'),
        }),
      );
    });
  }
}
