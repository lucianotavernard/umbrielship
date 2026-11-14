import { randomUUID } from 'crypto';

import type {
  Question,
  QuestionType,
} from '../inspection-template/inspection-template.entity.js';
import type { Inspection } from '../inspection/inspection.entity.js';

export type InspectionAssignmentItem = {
  id: string;
  label: string;
  position: number;
  type: QuestionType;
};

// The WorkOrderService the assignment inspects; null means the WorkOrder as a whole.
export type InspectionAssignmentService = { id: string; name: string } | null;

export type InspectionAssignmentProps = {
  organizationId: string;
  workOrderId: string;
  service: InspectionAssignmentService;
  templateName: string;
  questions: Question[];
  assignedBy: string;
  createdAt?: Date;
};

export type RestoredInspectionAssignmentProps = Omit<
  InspectionAssignmentProps,
  'questions' | 'createdAt'
> & {
  items: InspectionAssignmentItem[];
  createdAt: Date;
  // Visible Inspections, newest first, as read with the assignment.
  inspections?: Inspection[];
  // Every Inspection, discarded ones included: one is enough to keep the assignment (D5).
  inspectionCount?: number;
};

export class InspectionAssignment {
  id: string;
  organizationId: string;
  workOrderId: string;
  service: InspectionAssignmentService;
  templateName: string;
  assignedBy: string;
  createdAt: Date;
  items: InspectionAssignmentItem[];
  inspections: Inspection[];
  inspectionCount: number;

  private constructor(props: RestoredInspectionAssignmentProps, id?: string) {
    this.id = id ?? randomUUID();
    this.organizationId = props.organizationId;
    this.workOrderId = props.workOrderId;
    this.service = props.service;
    this.templateName = props.templateName;
    this.assignedBy = props.assignedBy;
    this.createdAt = props.createdAt;
    this.items = [...props.items].sort((a, b) => a.position - b.position);
    this.inspections = props.inspections ?? [];
    this.inspectionCount = props.inspectionCount ?? 0;
  }

  get removable() {
    return this.inspectionCount === 0;
  }

  // The questions are a copy (D3): numbered from 0 in the template's order, owned by the assignment.
  static create(props: InspectionAssignmentProps, id?: string) {
    const { questions, createdAt, ...rest } = props;

    return new InspectionAssignment(
      {
        ...rest,
        createdAt: createdAt ?? new Date(),
        items: questions.map(({ label, type }, position) => ({
          id: randomUUID(),
          label,
          position,
          type,
        })),
      },
      id,
    );
  }

  static restore(props: RestoredInspectionAssignmentProps, id: string) {
    return new InspectionAssignment(props, id);
  }
}
