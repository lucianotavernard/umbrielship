import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';

export const MAX_QUESTIONS = 100;
export const MAX_NAME_LENGTH = 100;
export const MAX_QUESTION_LENGTH = 200;

export const NAME_TAKEN = 'Já existe um modelo de inspeção com este nome';

// The API answers 409 when the Organization already has a template with that name.
export const isNameTaken = (response: unknown) =>
  response instanceof HttpErrorResponse && response.status === HttpStatusCode.Conflict;

export type QuestionType = 'TEXT' | 'YES_NO' | 'CONFORMITY' | 'SCORE';

export const QUESTION_TYPES: QuestionType[] = ['TEXT', 'YES_NO', 'CONFORMITY', 'SCORE'];

export const questionTypeLabels: Record<QuestionType, string> = {
  TEXT: 'Texto livre',
  YES_NO: 'Sim/Não',
  CONFORMITY: 'Conforme/Não conforme',
  SCORE: 'Nota de 0 a 10',
};

export type InspectionTemplateItem = {
  id: string;
  label: string;
  position: number;
  type: QuestionType;
};

export type InspectionTemplate = {
  id: string;
  name: string;
  createdAt: string;
  items: InspectionTemplateItem[];
};

export type InspectionTemplateSummary = {
  id: string;
  name: string;
  itemCount: number;
  createdAt: string;
};

export type InspectionTemplateRequest = {
  name: string;
  items: { label: string; type: QuestionType }[];
};

export type GetInspectionTemplatesResponse = {
  inspectionTemplates: InspectionTemplateSummary[];
  total: number;
};

export type GetInspectionTemplateResponse = {
  inspectionTemplate: InspectionTemplate;
};

@Service()
export class InspectionTemplateService {
  private readonly http = inject(HttpClient);

  createInspectionTemplate(
    request: InspectionTemplateRequest,
  ): Observable<GetInspectionTemplateResponse> {
    return this.http.post<GetInspectionTemplateResponse>('/api/inspection-templates', request);
  }

  updateInspectionTemplate(
    id: string,
    request: InspectionTemplateRequest,
  ): Observable<GetInspectionTemplateResponse> {
    return this.http.put<GetInspectionTemplateResponse>(`/api/inspection-templates/${id}`, request);
  }

  deleteInspectionTemplate(id: string): Observable<void> {
    return this.http.delete<void>(`/api/inspection-templates/${id}`);
  }
}
