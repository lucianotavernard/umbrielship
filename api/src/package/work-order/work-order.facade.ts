import { Injectable } from '@nestjs/common';

import { IInspectionTemplatesRepository } from './inspection-template/contracts/inspection-template-repository.contract.js';
import { IWorkOrdersRepository } from './work-order/contracts/work-order-repository.contract.js';

// The only way another context asks about the WorkOrders of an Organization: plain answers, no entity.
@Injectable()
export class WorkOrderFacade {
  constructor(
    private workOrdersRepository: IWorkOrdersRepository,
    private inspectionTemplatesRepository: IInspectionTemplatesRepository,
  ) {}

  /**
   * Whether the Organization still has a WorkOrder or an inspection template. Services, photos,
   * inspection assignments and inspections all belong to a WorkOrder.
   */
  async hasRecords(organizationId: string): Promise<boolean> {
    const [workOrders, templates] = await Promise.all([
      this.workOrdersRepository.findMany(organizationId, 1, 0),
      this.inspectionTemplatesRepository.findMany(organizationId, 1, 0),
    ]);

    return workOrders.total > 0 || templates.total > 0;
  }
}
