import { VesselDto } from '@/customer/data-access/dto/vessel.dto';

export type WorkOrderStatusDto = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type WorkOrderDto = {
  id: string;
  vesselId: string;
  startDate: string;
  endDate: string;
  status: WorkOrderStatusDto;
};

export type WorkOrderDetailDto = WorkOrderDto & {
  vessel: VesselDto & {
    vesselId: string;
  };
};

export type WorkOrderResponseDto = {
  workOrder: WorkOrderDetailDto;
};

export type WorkOrdersResponseDto = {
  workOrders: WorkOrderDto[];
  total: number;
};
