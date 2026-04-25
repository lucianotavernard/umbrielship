import { DatePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideClipboardList, lucidePencil } from '@ng-icons/lucide';

import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';

import type { WorkOrderDetailDto } from '@/work-order/data-access/dto/work-order.dto';

@Component({
  selector: 'work-order-detail-ui',
  templateUrl: './work-order-detail.html',
  imports: [NgIcon, Button, Badge, Skeleton, DatePipe],
  viewProviders: [provideIcons({ lucideClipboardList, lucidePencil })],
})
export class WorkOrderDetailUi {
  workOrder = input.required<WorkOrderDetailDto | null>();
  loading = input(false);

  edited = output<void>();

  status = computed(() => {
    const workOrder = this.workOrder();

    const labels = {
      PENDING: 'Pendente',
      IN_PROGRESS: 'Em andamento',
      COMPLETED: 'Concluído',
      CANCELLED: 'Cancelado',
    };

    return workOrder ? labels[workOrder.status] : 'Pendente';
  });

  editWorkOrder() {
    this.edited.emit();
  }
}
