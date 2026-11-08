import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

export type WorkOrderServiceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export const workOrderServiceStatusLabels: Record<WorkOrderServiceStatus, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
};

export type WorkOrderServiceItem = {
  id: string;
  workOrderId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: WorkOrderServiceStatus;
};

export type CreateWorkOrderServiceRequest = {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: WorkOrderServiceStatus;
};

export type GetWorkOrderServicesResponse = {
  services: WorkOrderServiceItem[];
  total: number;
};

@Service()
export class WorkOrderServiceService {
  private readonly http = inject(HttpClient);

  create(workOrderId: string, request: CreateWorkOrderServiceRequest): Observable<WorkOrderServiceItem> {
    return this.http.post<WorkOrderServiceItem>(`/api/work-orders/${workOrderId}/services`, request);
  }
}
