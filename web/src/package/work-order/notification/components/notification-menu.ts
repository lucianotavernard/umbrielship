import { httpResource } from '@angular/common/http';
import { Component, computed, effect, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideBell, lucideClipboardCheck, lucideClock3, lucideTriangleAlert } from '@ng-icons/lucide';

import type { Role } from '../../../identity/user/user.service';
import type { GetVesselsResponse } from '../../../customer/vessel/vessel.service';
import { resourceValue } from '../../../shared/components/lib/resource-value';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../../../shared/components/ui/dropdown-menu';
import type { GetOrganizationInspectionAssignmentsResponse } from '../../inspection-assignment/inspection-assignment.service';
import type { GetWorkOrdersResponse } from '../../work-order/work-order.service';
import { buildNotifications, type UserNotification } from '../notifications';

const SEEN_KEY = '@umbriel:notifications-seen';

const ICONS: Record<UserNotification['kind'], { icon: string; tone: string }> = {
  overdue: { icon: 'lucideTriangleAlert', tone: 'bg-[#fbefed] text-[#b86b61] dark:bg-[#2e1d1b] dark:text-[#e3a49b]' },
  'due-today': { icon: 'lucideClock3', tone: 'bg-[#fff4e5] text-[#b7791f] dark:bg-[#2e2516] dark:text-[#e0b76f]' },
  inspection: { icon: 'lucideClipboardCheck', tone: 'bg-primary/10 text-primary' },
};

function readSeen(key: string): ReadonlySet<string> {
  try {
    const stored = JSON.parse(localStorage.getItem(key) ?? '[]');
    return new Set(Array.isArray(stored) ? stored : []);
  } catch {
    return new Set();
  }
}

/**
 * The top bar's bell (AD-116): a dot while a notice has not been seen, and the menu of the mareos
 * that lists them. The notices are derived from the reads of the Role; opening the menu marks the
 * ones it shows as seen, in this browser, for this User.
 */
@Component({
  selector: 'notification-menu-ui',
  imports: [NgIcon, RouterLink, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel],
  viewProviders: [provideIcons({ lucideBell, lucideClipboardCheck, lucideClock3, lucideTriangleAlert })],
  template: `
    <t-dropdown-menu [(open)]="isOpen">
      <button
        tDropdownMenuTrigger
        type="button"
        data-slot="notification-trigger"
        class="relative grid size-[30px] place-items-center rounded-[7px] text-muted-foreground transition-colors hover:bg-accent hover:text-primary aria-expanded:bg-accent aria-expanded:text-primary"
        [attr.aria-label]="label()"
        [attr.title]="label()"
      >
        <ng-icon name="lucideBell" class="!size-[18px]" />
        @if (unread() > 0) {
          <i
            data-slot="notification-dot"
            aria-hidden="true"
            class="absolute top-[5px] right-[6px] size-[7px] rounded-full border border-card bg-[#eb8c56]"
          ></i>
        }
      </button>

      <t-dropdown-menu-content align="end" [sideOffset]="10" class="w-[360px] max-w-[calc(100vw-1.5rem)] rounded-[10px] p-0 shadow-[0_16px_40px_#172b3c24]">
        <div class="flex items-center justify-between border-b border-border px-[14px] pt-3 pb-2">
          <t-dropdown-menu-label class="p-0 text-[12px] font-bold text-foreground">Notificações</t-dropdown-menu-label>
          <span data-slot="notification-status" class="text-[9px] text-muted-foreground">{{ status() }}</span>
        </div>
        @if (notifications().length) {
          <div class="max-h-[320px] overflow-y-auto p-[5px]">
            @for (notification of notifications(); track notification.id) {
              <a
                tDropdownMenuItem
                data-slot="notification-item"
                class="items-start gap-2.5 rounded-[7px] px-[9px] py-2"
                [routerLink]="notification.link"
              >
                <span
                  aria-hidden="true"
                  class="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg"
                  [class]="icons[notification.kind].tone"
                >
                  <ng-icon [name]="icons[notification.kind].icon" class="!size-[14px]" />
                </span>
                <span class="grid min-w-0 flex-1 gap-0.5">
                  <strong data-slot="notification-title" class="truncate text-[11px] font-semibold text-foreground">{{
                    notification.title
                  }}</strong>
                  <small data-slot="notification-detail" class="truncate text-[10px] text-muted-foreground">{{
                    notification.detail
                  }}</small>
                </span>
                <time data-slot="notification-time" class="shrink-0 pt-0.5 text-[9px] whitespace-nowrap text-muted-foreground">{{
                  notification.time
                }}</time>
              </a>
            }
          </div>
        } @else {
          <p data-slot="notification-empty" class="px-[14px] py-6 text-center text-[11px] text-muted-foreground">
            Nenhuma notificação por enquanto.
          </p>
        }
        <div class="border-t border-border px-[14px] py-[9px] text-center text-[9px] text-muted-foreground">
          {{ notifications().length ? 'Avisos das ordens e inspeções da organização ativa' : 'Você está em dia com a operação' }}
        </div>
      </t-dropdown-menu-content>
    </t-dropdown-menu>
  `,
})
export class NotificationMenu {
  /** The signed-in User and the Role it holds in the active Organization, from `GET /me`. */
  readonly userId = input.required<string>();
  readonly role = input.required<Role>();

  protected readonly icons = ICONS;
  protected readonly isOpen = signal(false);

  private readonly writer = computed(() => this.role() === 'administrator' || this.role() === 'operator');

  // Each Role reads only what its notices need.
  private readonly workOrderResource = httpResource<GetWorkOrdersResponse>(() =>
    this.writer() ? '/api/work-orders' : undefined,
  );
  private readonly assignmentResource = httpResource<GetOrganizationInspectionAssignmentsResponse>(() =>
    this.role() === 'inspector' ? '/api/inspection-assignments' : undefined,
  );
  private readonly vesselResource = httpResource<GetVesselsResponse>(() =>
    this.writer() || this.role() === 'inspector' ? '/api/vessels' : undefined,
  );

  private readonly seenKey = computed(() => `${SEEN_KEY}:${this.userId()}`);
  private readonly seen = signal<ReadonlySet<string>>(new Set());

  readonly notifications = computed(() =>
    buildNotifications({
      role: this.role(),
      workOrders: resourceValue(this.workOrderResource)?.workOrders ?? [],
      assignments: resourceValue(this.assignmentResource)?.inspectionAssignments ?? [],
      vesselNames: Object.fromEntries(
        (resourceValue(this.vesselResource)?.vessels ?? []).map((vessel) => [vessel.id, vessel.name]),
      ),
      now: new Date(),
    }),
  );

  readonly unread = computed(() => this.notifications().filter((item) => !this.seen().has(item.id)).length);

  /** How many were new when the menu opened, kept while it stays open. */
  private readonly newOnOpen = signal(0);
  protected readonly status = computed(() => {
    const count = this.newOnOpen();
    if (count === 0) return 'Atualizadas';
    return count === 1 ? '1 nova' : `${count} novas`;
  });

  protected readonly label = computed(() => {
    const count = this.unread();
    if (count === 0) return 'Notificações';
    return count === 1 ? 'Notificações: 1 nova' : `Notificações: ${count} novas`;
  });

  constructor() {
    effect(() => this.seen.set(readSeen(this.seenKey())));

    // Opening the menu marks what it shows as seen; only the notices that still hold are kept.
    effect(() => {
      if (!this.isOpen()) return;
      untracked(() => {
        this.newOnOpen.set(this.unread());
        const ids = this.notifications().map((item) => item.id);
        this.seen.set(new Set(ids));
        try {
          localStorage.setItem(this.seenKey(), JSON.stringify(ids));
        } catch {
          // A browser that keeps nothing shows the dot again next time.
        }
        this.workOrderResource.reload();
        this.assignmentResource.reload();
      });
    });
  }
}
