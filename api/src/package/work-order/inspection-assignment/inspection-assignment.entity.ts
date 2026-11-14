import { randomUUID } from 'crypto';

export type InspectionAssignmentItem = {
  id: string;
  label: string;
  position: number;
};

// The WorkOrderService the assignment inspects; null means the WorkOrder as a whole.
export type InspectionAssignmentService = { id: string; name: string } | null;

export type InspectionAssignmentProps = {
  organizationId: string;
  workOrderId: string;
  service: InspectionAssignmentService;
  templateName: string;
  labels: string[];
  assignedBy: string;
  createdAt?: Date;
};

export type RestoredInspectionAssignmentProps = Omit<
  InspectionAssignmentProps,
  'labels' | 'createdAt'
> & {
  items: InspectionAssignmentItem[];
  createdAt: Date;
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

  private constructor(props: RestoredInspectionAssignmentProps, id?: string) {
    this.id = id ?? randomUUID();
    this.organizationId = props.organizationId;
    this.workOrderId = props.workOrderId;
    this.service = props.service;
    this.templateName = props.templateName;
    this.assignedBy = props.assignedBy;
    this.createdAt = props.createdAt;
    this.items = [...props.items].sort((a, b) => a.position - b.position);
  }

  // The questions are a copy (D3): numbered from 0 in the template's order, owned by the assignment.
  static create(props: InspectionAssignmentProps, id?: string) {
    const { labels, createdAt, ...rest } = props;

    return new InspectionAssignment(
      {
        ...rest,
        createdAt: createdAt ?? new Date(),
        items: labels.map((label, position) => ({
          id: randomUUID(),
          label,
          position,
        })),
      },
      id,
    );
  }

  static restore(props: RestoredInspectionAssignmentProps, id: string) {
    return new InspectionAssignment(props, id);
  }
}
