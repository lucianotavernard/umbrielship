import { randomUUID } from 'crypto';

export type Role = 'administrator' | 'operator' | 'inspector';

export type Membership = {
  organizationId: string;
  role: Role;
};

export type UserProps = {
  name: string;
  email: string;
  password: string;
  activeOrganizationId: string | null;
  memberships: Membership[];
};

export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  activeOrganizationId: string | null;
  memberships: Membership[];

  private constructor(props: UserProps, id?: string) {
    this.id = id ?? randomUUID();
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.activeOrganizationId = props.activeOrganizationId;
    this.memberships = props.memberships;
  }

  static create(props: UserProps, id?: string) {
    return new User(props, id);
  }
}
