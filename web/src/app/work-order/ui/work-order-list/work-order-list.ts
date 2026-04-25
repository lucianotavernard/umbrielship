import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboardList, lucideFlag, lucideCalendar } from '@ng-icons/lucide';

import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';

import type { WorkOrderDto, WorkOrderStatusDto } from '@/work-order/data-access/dto/work-order.dto';

@Component({
  selector: 'work-order-list-ui',
  templateUrl: './work-order-list.html',
  imports: [RouterLink, NgIcon, DatePipe, Badge, Skeleton],
  viewProviders: [provideIcons({ lucideClipboardList, lucideFlag, lucideCalendar })],
})
export class WorkOrderListUi {
  loading = input(true);
  workOrders = input<WorkOrderDto[]>([]);

  getStatus(status: WorkOrderStatusDto) {
    const labels = {
      PENDING: 'Pendente',
      IN_PROGRESS: 'Em andamento',
      COMPLETED: 'Concluído',
      CANCELLED: 'Cancelado',
    };

    return labels[status];
  }
}
