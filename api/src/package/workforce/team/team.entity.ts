import { randomUUID } from 'crypto';

export type TeamProps = {
  organizationId: string;
  name: string;
  specialty: string;
};

export class Team {
  id: string;
  organizationId: string;
  name: string;
  specialty: string;

  private constructor(props: TeamProps, id?: string) {
    this.id = id ?? randomUUID();
    this.organizationId = props.organizationId;
    this.name = props.name;
    this.specialty = props.specialty;
  }

  static create(props: TeamProps, id?: string) {
    return new Team(props, id);
  }
}
