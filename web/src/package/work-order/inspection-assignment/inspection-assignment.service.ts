import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

export type InspectionAssignmentItem = {
  id: string;
  label: string;
  position: number;
};

export type InspectionAssignment = {
  id: string;
  templateName: string;
  // The service the assignment inspects; null means the WorkOrder as a whole.
  service: { id: string; name: string } | null;
  createdAt: string;
  items: InspectionAssignmentItem[];
};

export type AssignInspectionTemplateRequest = {
  templateId: string;
  serviceId?: string;
};

export type GetInspectionAssignmentsResponse = {
  inspectionAssignments: InspectionAssignment[];
};

export const WHOLE_WORK_ORDER = 'Ordem de serviço inteira';

@Service()
export class InspectionAssignmentService {
  private readonly http = inject(HttpClient);

  assign(
    workOrderId: string,
    request: AssignInspectionTemplateRequest,
  ): Observable<{ inspectionAssignment: InspectionAssignment }> {
    return this.http.post<{ inspectionAssignment: InspectionAssignment }>(
      `/api/work-orders/${workOrderId}/inspection-assignments`,
      request,
    );
  }

  remove(workOrderId: string, id: string): Observable<void> {
    return this.http.delete<void>(`/api/work-orders/${workOrderId}/inspection-assignments/${id}`);
  }
}
