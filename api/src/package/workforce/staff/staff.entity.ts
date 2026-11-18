import { randomUUID } from 'crypto';

export type StaffProps = {
  organizationId: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  teamId: string | null;
};

// A person the Organization allocates to WorkOrderServices. Not a User: it never signs in.
export class Staff {
  id: string;
  organizationId: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  teamId: string | null;

  private constructor(props: StaffProps, id?: string) {
    this.id = id ?? randomUUID();
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.specialty = props.specialty;
    this.email = props.email;
    this.phone = props.phone;
    this.teamId = props.teamId;
  }

  static create(props: StaffProps, id?: string) {
    return new Staff(props, id);
  }
}
