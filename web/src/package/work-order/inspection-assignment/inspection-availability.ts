/**
 * Why an assignment cannot be inspected now, or null when it can: the WorkOrder must be
 * `IN_PROGRESS` and, when the assignment targets a service, that service too (D6, AD-018, AD-043).
 */
export function inspectionBlockedReason(
  workOrderStatus: string | null | undefined,
  serviceStatus: string | null | undefined,
  targetsService: boolean,
): string | null {
  if (workOrderStatus !== 'IN_PROGRESS') return 'Disponível com a ordem em andamento';
  if (targetsService && serviceStatus !== 'IN_PROGRESS') return 'Disponível com o serviço em andamento';
  return null;
}
