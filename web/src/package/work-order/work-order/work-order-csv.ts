import { csvDocument } from '../../shared/components/lib/csv';
import { numericDateTime, WorkOrderRow } from './work-order-filters';
import { workOrderCode, workOrderStatusLabels } from './work-order.service';

/** The mareos columns minus Categoria, Equipe, Prazo, Data de abertura and Prioridade (AD-034, AD-044). */
export const WORK_ORDER_CSV_HEADER = ['OS', 'Embarcação', 'Cliente', 'Serviço', 'Docagem', 'Desdocagem', 'Status'];

/** One line per WorkOrder; its services joined by " · ", dates as `dd/MM/yyyy HH:mm`. */
export function workOrdersCsv(rows: WorkOrderRow[]): string {
  return csvDocument([
    WORK_ORDER_CSV_HEADER,
    ...rows.map((row) => [
      workOrderCode(row.id),
      row.vesselName,
      row.customerName,
      row.services.map((service) => service.name).join(' · '),
      numericDateTime(row.startDate),
      numericDateTime(row.endDate),
      workOrderStatusLabels[row.status],
    ]),
  ]);
}
