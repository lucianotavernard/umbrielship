import { randomUUID } from 'crypto';

export type OrganizationProps = {
  name: string;
  email: string;
  isInternal: boolean;
};

export class Organization {
  id: string;
  name: string;
  email: string;
  isInternal: boolean;

  private constructor(props: OrganizationProps, id?: string) {
    this.id = id ?? randomUUID();
    this.name = props.name;
    this.email = props.email;
    this.isInternal = props.isInternal;
  }

  static create(props: OrganizationProps, id?: string) {
    return new Organization(props, id);
  }
}
