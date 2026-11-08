import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

export type WorkOrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export const workOrderStatusLabels: Record<WorkOrderStatus, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

export type WorkOrder = {
  id: string;
  vesselId: string;
  startDate: string;
  endDate: string;
  status: WorkOrderStatus;
};

export type WorkOrderDetail = {
  id: string;
  startDate: string;
  endDate: string;
  status: WorkOrderStatus;
  vessel: {
    vesselId: string;
    name: string;
    type: string;
    length: number;
  };
};

export type CreateWorkOrderRequest = {
  vesselId: string;
  startDate: string;
  endDate: string;
  status: WorkOrderStatus;
};

export type UpdateWorkOrderRequest = {
  startDate: string;
  endDate: string;
  status: WorkOrderStatus;
};

export type GetWorkOrdersResponse = {
  workOrders: WorkOrder[];
  total: number;
};

export type GetWorkOrderResponse = {
  workOrder: WorkOrderDetail;
};

@Service()
export class WorkOrderService {
  private readonly http = inject(HttpClient);

  createWorkOrder(request: CreateWorkOrderRequest): Observable<GetWorkOrderResponse> {
    return this.http.post<GetWorkOrderResponse>('/api/work-orders', request);
  }

  updateWorkOrder(id: string, request: UpdateWorkOrderRequest): Observable<void> {
    return this.http.put<void>(`/api/work-orders/${id}`, request);
  }
}
