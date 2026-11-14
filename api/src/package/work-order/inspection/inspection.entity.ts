import { randomUUID } from 'crypto';

import type { QuestionType } from '../inspection-template/inspection-template.entity.js';

export const INSPECTION_RESULTS = ['APPROVED', 'REPROVED'] as const;

export type InspectionResult = (typeof INSPECTION_RESULTS)[number];

// A text for TEXT, a boolean for YES_NO and CONFORMITY (true is "Sim" or "Conforme"), 0 to 10 for SCORE.
export type AnswerValue = string | boolean | number;

export type InspectionAnswer = {
  id: string;
  itemId: string;
  notApplicable: boolean;
  value: AnswerValue | null;
  note: string | null;
};

export type InspectionProps = {
  organizationId: string;
  assignmentId: string;
  result: InspectionResult;
  inspectorId: string;
  inspectorName: string;
  answers: Omit<InspectionAnswer, 'id'>[];
  completedAt?: Date;
};

export type RestoredInspectionProps = Omit<
  InspectionProps,
  'answers' | 'completedAt'
> & {
  answers: InspectionAnswer[];
  completedAt: Date;
  discardedAt: Date | null;
  discardedBy: string | null;
};

export const TEXT_MAX_LENGTH = 1000;

// Whether `value` is an answer a question of `type` accepts. Text arrives trimmed.
export function fitsType(type: QuestionType, value: unknown): boolean {
  switch (type) {
    case 'TEXT':
      return (
        typeof value === 'string' &&
        value.length >= 1 &&
        value.length <= TEXT_MAX_LENGTH
      );
    case 'YES_NO':
    case 'CONFORMITY':
      return typeof value === 'boolean';
    case 'SCORE':
      return (
        typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= 0 &&
        value <= 10
      );
  }
}

export class Inspection {
  id: string;
  organizationId: string;
  assignmentId: string;
  result: InspectionResult;
  inspectorId: string;
  inspectorName: string;
  completedAt: Date;
  discardedAt: Date | null;
  discardedBy: string | null;
  answers: InspectionAnswer[];

  private constructor(props: RestoredInspectionProps, id?: string) {
    this.id = id ?? randomUUID();
    this.organizationId = props.organizationId;
    this.assignmentId = props.assignmentId;
    this.result = props.result;
    this.inspectorId = props.inspectorId;
    this.inspectorName = props.inspectorName;
    this.completedAt = props.completedAt;
    this.discardedAt = props.discardedAt;
    this.discardedBy = props.discardedBy;
    this.answers = props.answers;
  }

  static create(props: InspectionProps, id?: string) {
    const { answers, completedAt, ...rest } = props;

    return new Inspection(
      {
        ...rest,
        completedAt: completedAt ?? new Date(),
        discardedAt: null,
        discardedBy: null,
        answers: answers.map((answer) => ({ id: randomUUID(), ...answer })),
      },
      id,
    );
  }

  static restore(props: RestoredInspectionProps, id: string) {
    return new Inspection(props, id);
  }

  get discarded() {
    return this.discardedAt !== null;
  }

  // A discard hides the Inspection from every read; the row stays (D4).
  discard(by: string, at = new Date()) {
    this.discardedAt = at;
    this.discardedBy = by;
  }
}
