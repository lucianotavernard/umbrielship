import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

import type { QuestionType } from '../inspection-template/inspection-template.service';

export type InspectionResult = 'APPROVED' | 'REPROVED';

export const inspectionResultLabels: Record<InspectionResult, string> = {
  APPROVED: 'Aprovada',
  REPROVED: 'Reprovada',
};

// A text for TEXT, a boolean for YES_NO and CONFORMITY, 0 to 10 for SCORE.
export type AnswerValue = string | boolean | number;

export type InspectionAnswer = {
  itemId: string;
  notApplicable: boolean;
  value: AnswerValue | null;
  note: string | null;
};

export type Inspection = {
  id: string;
  result: InspectionResult;
  inspectorName: string;
  completedAt: string;
  answers: InspectionAnswer[];
};

export type CompleteInspectionRequest = {
  result: InspectionResult;
  answers: { itemId: string; notApplicable?: boolean; value?: AnswerValue; note?: string }[];
};

export const TEXT_MAX_LENGTH = 1000;
export const NOTE_MAX_LENGTH = 500;

// How an answer reads, by its question's type.
export function answerLabel(type: QuestionType, answer: InspectionAnswer): string {
  if (answer.notApplicable) return 'Não se aplica';
  switch (type) {
    case 'YES_NO':
      return answer.value ? 'Sim' : 'Não';
    case 'CONFORMITY':
      return answer.value ? 'Conforme' : 'Não conforme';
    default:
      return String(answer.value ?? '');
  }
}

@Service()
export class InspectionService {
  private readonly http = inject(HttpClient);

  private path(workOrderId: string, assignmentId: string) {
    return `/api/work-orders/${workOrderId}/inspection-assignments/${assignmentId}/inspections`;
  }

  complete(
    workOrderId: string,
    assignmentId: string,
    request: CompleteInspectionRequest,
  ): Observable<{ inspection: Inspection }> {
    return this.http.post<{ inspection: Inspection }>(this.path(workOrderId, assignmentId), request);
  }

  discard(workOrderId: string, assignmentId: string, id: string): Observable<void> {
    return this.http.post<void>(`${this.path(workOrderId, assignmentId)}/${id}/discard`, {});
  }
}
