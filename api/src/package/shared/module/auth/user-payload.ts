export const ROLES = ['administrator', 'operator', 'inspector'] as const;

export type Role = (typeof ROLES)[number];

export type UserPayload = {
  sub: string;
  organizationId: string;
  role: Role;
  internal: boolean;
};
