import { randomUUID } from 'crypto';

export type AssignmentProps = {
  organizationId: string;
  workOrderId: string;
  workOrderServiceId: string;
  staffId: string | null;
  teamId: string | null;
};

// One Staff or one Team answering for one WorkOrderService, over that service's period (AD-076).
export class Assignment {
  id: string;
  organizationId: string;
  workOrderId: string;
  workOrderServiceId: string;
  staffId: string | null;
  teamId: string | null;

  private constructor(props: AssignmentProps, id?: string) {
    this.id = id ?? randomUUID();
    this.organizationId = props.organizationId;
    this.workOrderId = props.workOrderId;
    this.workOrderServiceId = props.workOrderServiceId;
    this.staffId = props.staffId;
    this.teamId = props.teamId;
  }

  static create(props: AssignmentProps, id?: string) {
    return new Assignment(props, id);
  }
}
