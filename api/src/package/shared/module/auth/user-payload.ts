export type Role = 'administrator' | 'operator' | 'inspector';

export type UserPayload = {
  sub: string;
  organizationId: string;
  role: Role;
  internal: boolean;
};
