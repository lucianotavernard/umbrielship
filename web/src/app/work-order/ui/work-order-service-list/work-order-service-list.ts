import { Component, input } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePlus, lucideWrench } from '@ng-icons/lucide';

import { Badge } from '@/shared/ui/badge';
import { Skeleton } from '@/shared/ui/skeleton';

import type { WorkOrderServiceDto, WorkOrderServiceStatusDto } from '@/work-order/data-access/dto/work-order-service.dto';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'work-order-service-list-ui',
  templateUrl: './work-order-service-list.html',
  imports: [NgIcon, DatePipe, Badge, Skeleton],
  viewProviders: [provideIcons({ lucidePlus, lucideWrench })],
})
export class WorkOrderServiceListUi {
  services = input<WorkOrderServiceDto[]>([]);
  
  loading = input(true);

  getStatus(status: WorkOrderServiceStatusDto) {
    const labels = {
      PENDING: 'Pendente',
      IN_PROGRESS: 'Em andamento',
      COMPLETED: 'Concluído',
    };

    return labels[status];
  }
}
