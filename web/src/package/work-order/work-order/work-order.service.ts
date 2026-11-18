import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

import type { WorkOrderServiceStatus } from '../work-order-service/work-order-service.service';

export type WorkOrderStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export const WORK_ORDER_STATUSES: WorkOrderStatus[] = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export const workOrderStatusLabels: Record<WorkOrderStatus, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
};

/** The mareos status pills: in progress blue, done green, cancelled rose, pending grey. */
export const workOrderStatusTones: Record<WorkOrderStatus, string> = {
  PENDING: 'bg-[#f0f2f4] text-[#778590] dark:bg-[#1a2632] dark:text-[#9aaab8]',
  IN_PROGRESS: 'bg-[#edf4fb] text-[#4e84b7] dark:bg-[#18283a] dark:text-[#8db4dc]',
  COMPLETED: 'bg-[#eaf5ef] text-[#498b68] dark:bg-[#15291f] dark:text-[#8fcfab]',
  CANCELLED: 'bg-[#fbefed] text-[#b86b61] dark:bg-[#2e1d1b] dark:text-[#e3a49b]',
};

/** "#AB12CD34": the short code of a WorkOrder, the first 8 characters of its id. */
export function workOrderCode(id: string): string {
  return `#${id.slice(0, 8).toUpperCase()}`;
}

/** A service as `GET /work-orders` lists it with its WorkOrder (Landing door 1). */
export type WorkOrderServiceSummary = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: WorkOrderServiceStatus;
};

export type WorkOrder = {
  id: string;
  vesselId: string;
  startDate: string;
  endDate: string;
  status: WorkOrderStatus;
  /** By `startDate`, then `name`. */
  services: WorkOrderServiceSummary[];
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

/** A service written with its WorkOrder: it takes the WorkOrder's period and starts `PENDING`. */
export type NewWorkOrderService = {
  name: string;
  description: string;
  /** The Responsável, one of the two at most; only an administrator sends it (AD-079). */
  staffId?: string;
  teamId?: string;
};

/** The Responsável of an existing service; neither id clears it (AD-077). */
export type WorkOrderServiceAssignee = { id: string; staffId?: string; teamId?: string };

export type CreateWorkOrderRequest = {
  vesselId: string;
  startDate: string;
  endDate: string;
  status: WorkOrderStatus;
  services?: NewWorkOrderService[];
};

export type UpdateWorkOrderRequest = {
  startDate: string;
  endDate: string;
  status: WorkOrderStatus;
  services?: WorkOrderServiceAssignee[];
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

  updateWorkOrder(workOrderId: string, request: UpdateWorkOrderRequest): Observable<void> {
    return this.http.put<void>(`/api/work-orders/${workOrderId}`, request);
  }

  deleteWorkOrder(workOrderId: string): Observable<void> {
    return this.http.delete<void>(`/api/work-orders/${workOrderId}`);
  }
}
