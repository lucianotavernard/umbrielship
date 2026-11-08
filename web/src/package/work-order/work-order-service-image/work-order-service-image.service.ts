import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

export type WorkOrderServiceImage = {
  id: string;
  url: string;
};

@Service()
export class WorkOrderServiceImageService {
  private readonly http = inject(HttpClient);

  upload(workOrderId: string, serviceId: string, file: File): Observable<{ image: WorkOrderServiceImage }> {
    const body = new FormData();
    body.set('file', file);
    return this.http.post<{ image: WorkOrderServiceImage }>(
      `/api/work-orders/${workOrderId}/services/${serviceId}/images`,
      body,
    );
  }
}
