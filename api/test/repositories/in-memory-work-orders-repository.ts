import { Paginate } from '@/package/shared/lib/type/paginate.js';
import { WorkOrderService } from '@/package/work-order/work-order-service/work-order-service.entity.js';
import { WorkOrder } from '@/package/work-order/work-order/work-order.entity.js';
import { WorkOrderSummary } from '@/package/work-order/work-order/work-order-summary.entity.js';
import { IWorkOrdersRepository } from '@/package/work-order/work-order/contracts/work-order-repository.contract.js';

import { InMemoryWorkOrderServicesRepository } from './in-memory-work-order-services-repository.js';

export class InMemoryWorkOrdersRepository implements IWorkOrdersRepository {
  public items: WorkOrder[] = [];

  // The services a create writes and a list reads, as the work_order_services table.
  constructor(
    public readonly services = new InMemoryWorkOrderServicesRepository(),
  ) {}

  private of(organizationId: string) {
    return this.items.filter((item) => item.organizationId === organizationId);
  }

  // Each WorkOrder with its services by start date, then name, as the Prisma read gives them.
  private page(
    owned: WorkOrder[],
    take?: number,
    skip?: number,
  ): Paginate<WorkOrderSummary> {
    const start = skip ?? 0;
    const rows =
      take === undefined
        ? owned.slice(start)
        : owned.slice(start, start + take);

    return {
      data: rows.map(({ id, ...props }) =>
        WorkOrderSummary.create(
          {
            ...props,
            services: this.services.items
              .filter(
                (service) =>
                  service.workOrderId === id &&
                  service.organizationId === props.organizationId,
              )
              .sort(
                (a, b) =>
                  a.startDate.getTime() - b.startDate.getTime() ||
                  a.name.localeCompare(b.name),
              )
              .map(({ id, name, startDate, endDate, status }) => ({
                id,
                name,
                startDate,
                endDate,
                status,
              })),
          },
          id,
        ),
      ),
      total: owned.length,
    };
  }

  async findById(
    organizationId: string,
    id: string,
  ): Promise<WorkOrder | null> {
    return this.of(organizationId).find((item) => item.id === id) ?? null;
  }

  async findMany(
    organizationId: string,
    take?: number,
    skip?: number,
  ): Promise<Paginate<WorkOrderSummary>> {
    return this.page(this.of(organizationId), take, skip);
  }

  async findManyByVesselId(
    organizationId: string,
    vesselId: string,
    take?: number,
    skip?: number,
  ): Promise<Paginate<WorkOrderSummary>> {
    return this.page(
      this.of(organizationId).filter((item) => item.vesselId === vesselId),
      take,
      skip,
    );
  }

  async create(
    workOrder: WorkOrder,
    services: WorkOrderService[] = [],
  ): Promise<void> {
    this.items.push(workOrder);
    this.services.items.push(...services);
  }

  async save(workOrder: WorkOrder): Promise<void> {
    const index = this.items.findIndex((item) => item.id === workOrder.id);
    if (index >= 0) this.items[index] = workOrder;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
