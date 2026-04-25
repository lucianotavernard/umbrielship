import type { WorkOrderServiceImageDto } from './work-order-service-image.dto';

export type WorkOrderServiceStatusDto = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export type WorkOrderServiceDto = {
  id: string;
  workOrderId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: WorkOrderServiceStatusDto;
};

export type WorkOrderServicesResponseDto = {
  services: WorkOrderServiceDto[];
  total: number;
};