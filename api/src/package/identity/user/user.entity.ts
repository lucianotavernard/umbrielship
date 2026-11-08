import { randomUUID } from 'crypto';

export type UserRole = 'USER' | 'MANAGER' | 'DEVELOPER';

export type UserProps = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
};

export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;

  private constructor(props: UserProps, id?: string) {
    this.id = id ?? randomUUID();
    this.name = props.name;
    this.email = props.email;
    this.password = props.password;
    this.role = props.role;
  }

  static create(props: UserProps, id?: string) {
    return new User(props, id);
  }
}
