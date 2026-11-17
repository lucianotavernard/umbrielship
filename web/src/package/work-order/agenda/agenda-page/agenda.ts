import { httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { Router } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideAnchor,
  lucideArrowUpRight,
  lucideCalendarDays,
  lucideChevronLeft,
  lucideChevronRight,
  lucideClock3,
  lucidePlus,
  lucideSearch,
  lucideShip,
  lucideSlidersHorizontal,
  lucideWrench,
  lucideX,
} from '@ng-icons/lucide';

import { GetVesselsResponse } from '../../../customer/vessel/vessel.service';
import { AuthenticationService } from '../../../identity/authentication/authentication.service';
import { apiErrorMessage } from '../../../shared/components/lib/api-error-message';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import { Metric, twoDigits } from '../../../shared/components/ui/metric';
import { Sheet } from '../../../shared/components/ui/sheet';
import { Skeleton } from '../../../shared/components/ui/skeleton';
import { toast } from '../../../shared/components/ui/toaster';
import { WorkOrderServiceService } from '../../work-order-service/work-order-service.service';
import { GetWorkOrdersResponse } from '../../work-order/work-order.service';
import {
  addDays,
  AGENDA_ROWS,
  AgendaItem,
  agendaItems,
  AgendaKind,
  agendaKindLabels,
  dateKey,
  filterAgenda,
  itemCountLabel,
  itemsOn,
  longDayLabel,
  rangeLabel,
  rowOf,
  startOfDay,
  weekDays,
  weekdayLabel,
  weekLabel,
} from '../agenda-week';
import { AppointmentForm, AppointmentRequest } from '../components/appointment-form';

const kindTones: Record<AgendaKind, string> = {
  SERVICE: 'border-l-[#608ebd] bg-[#edf3fa] dark:bg-[#18283a]',
  DOCKING: 'border-l-[#c78753] bg-[#faf0e8] dark:bg-[#30291f]',
  UNDOCKING: 'border-l-[#8a72a7] bg-[#f2eff8] dark:bg-[#251f30]',
};

const dotTones: Record<AgendaKind, string> = {
  SERVICE: 'bg-[#608ebd]',
  DOCKING: 'bg-[#c78753]',
  UNDOCKING: 'bg-[#8a72a7]',
};

/** The colour of a day panel item's circle on the timeline rail. */
const railTones: Record<AgendaKind, string> = {
  SERVICE: 'text-[#608ebd]',
  DOCKING: 'text-[#c78753]',
  UNDOCKING: 'text-[#8a72a7]',
};

/** The mareos "Agenda" (AD-036, AD-047): a week of services, dockings and undockings. */
@Component({
  selector: 'agenda',
  imports: [NgIcon, Metric, Sheet, Skeleton, AppointmentForm],
  viewProviders: [
    provideIcons({
      lucideAnchor,
      lucideArrowUpRight,
      lucideCalendarDays,
      lucideChevronLeft,
      lucideChevronRight,
      lucideClock3,
      lucidePlus,
      lucideSearch,
      lucideShip,
      lucideSlidersHorizontal,
      lucideWrench,
      lucideX,
    }),
  ],
  templateUrl: './agenda.html',
})
export class Agenda {
  protected readonly canWrite = inject(AuthenticationService).canWrite;
  private readonly router = inject(Router);
  private readonly serviceService = inject(WorkOrderServiceService);
  private readonly appointmentForm = viewChild(AppointmentForm);

  workOrderResource = httpResource<GetWorkOrdersResponse>(() => '/api/work-orders');
  vesselResource = httpResource<GetVesselsResponse>(() => '/api/vessels');

  protected readonly rows = AGENDA_ROWS;
  protected readonly kinds: AgendaKind[] = ['SERVICE', 'DOCKING', 'UNDOCKING'];
  protected readonly kindLabels = agendaKindLabels;
  protected readonly kindTones = kindTones;
  protected readonly dotTones = dotTones;
  protected readonly railTones = railTones;
  protected readonly weekday = weekdayLabel;
  protected readonly countLabel = itemCountLabel;
  protected readonly longDay = longDayLabel;

  today = signal(startOfDay(new Date()));
  focus = signal(startOfDay(new Date()));
  view = signal<'week' | 'day'>('week');
  kind = signal<AgendaKind | null>(null);
  search = signal('');
  submitting = signal(false);
  isSheetActive = signal(false);

  loading = computed(() => this.workOrderResource.isLoading() || this.vesselResource.isLoading());
  private readonly workOrders = computed(() => resourceValue(this.workOrderResource)?.workOrders ?? []);
  private readonly vesselNames = computed(
    () => new Map((resourceValue(this.vesselResource)?.vessels ?? []).map((vessel) => [vessel.id, vessel.name])),
  );
  private readonly items = computed(() => agendaItems(this.workOrders(), this.vesselNames()));

  week = computed(() => weekDays(this.focus()));
  shownDays = computed(() => (this.view() === 'day' ? [this.focus()] : this.week()));
  label = computed(() => weekLabel(this.week()));
  range = computed(() => rangeLabel(this.week()));

  /** The items of the week that match the search, any type: the "Todas" count. */
  private readonly searched = computed(() => itemsOn(filterAgenda(this.items(), null, this.search()), this.week()));
  /** The week's items after the type and the search. */
  visible = computed(() => filterAgenda(this.searched(), this.kind(), ''));
  allCount = computed(() => this.searched().length);

  metrics = computed(() => ({
    week: twoDigits(this.visible().length),
    dockings: twoDigits(this.visible().filter((item) => item.kind === 'DOCKING').length),
  }));

  dayItems = computed(() => itemsOn(this.visible(), [this.focus()]));

  /** The WorkOrders a new service may join: `PENDING` or `IN_PROGRESS`. */
  openWorkOrders = computed(() =>
    this.workOrders()
      .filter((order) => order.status === 'PENDING' || order.status === 'IN_PROGRESS')
      .map((order) => ({ id: order.id, vesselName: this.vesselNames().get(order.vesselId) ?? '' })),
  );

  constructor() {
    effect(() => {
      const errors = [this.workOrderResource, this.vesselResource]
        .map((resource) => resource.error())
        .filter((error) => !!error);
      // The toaster keeps its toasts in a signal: reading it here would re-run this effect forever.
      untracked(() => {
        for (const error of errors) {
          toast.error('Erro ao carregar a agenda', {
            description: apiErrorMessage(error as { error?: unknown }, 'Não foi possível carregar a agenda.'),
          });
        }
      });
    });
  }

  isToday(day: Date) {
    return dateKey(day) === dateKey(this.today());
  }

  isFocused(day: Date) {
    return dateKey(day) === dateKey(this.focus());
  }

  cell(day: Date, row: number): AgendaItem[] {
    const key = dateKey(day);
    return this.visible().filter((item) => dateKey(item.at) === key && rowOf(item.at) === row);
  }

  dayCount(day: Date) {
    return itemsOn(this.visible(), [day]).length;
  }

  goToday() {
    const today = startOfDay(new Date());
    this.today.set(today);
    this.focus.set(today);
  }

  move(direction: -1 | 1) {
    this.focus.update((focus) => addDays(focus, direction * (this.view() === 'day' ? 1 : 7)));
  }

  pickDay(day: Date) {
    this.focus.set(day);
  }

  openItem(item: AgendaItem) {
    void this.router.navigate(['/work-orders', item.workOrderId]);
  }

  cellLabel(day: Date, row: number) {
    return `Criar compromisso em ${longDayLabel(day)} às ${AGENDA_ROWS[row]}`;
  }

  itemLabel(item: AgendaItem) {
    return `${item.time}, ${item.vesselName}, ${item.title}, ${item.code}`;
  }

  /** Opens "Novo compromisso" with "Início" at the cell's hour, or at 08:00 of the day given (AC 67). */
  openAppointment(day: Date, row: number | null) {
    const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), row === null ? 8 : 8 + row * 2);
    this.appointmentForm()?.open(start);
    this.isSheetActive.set(true);
  }

  closeSheet() {
    this.isSheetActive.set(false);
  }

  addAppointment(request: AppointmentRequest) {
    this.submitting.set(true);
    this.serviceService
      .create(request.workOrderId, {
        name: request.name,
        description: request.description,
        startDate: request.startDate,
        endDate: request.endDate,
        status: 'PENDING',
      })
      .subscribe({
        next: () => {
          toast.success('Serviço criado com sucesso', { description: 'O serviço foi adicionado à agenda.' });
          this.submitting.set(false);
          this.closeSheet();
          this.workOrderResource.reload();
        },
        error: (response) => {
          this.submitting.set(false);
          toast.error('Erro ao criar serviço', {
            description: apiErrorMessage(response, 'Ocorreu um erro ao criar o serviço.'),
          });
        },
      });
  }
}
