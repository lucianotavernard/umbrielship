export const ROLES = ['administrator', 'operator', 'inspector'] as const;

export type Role = (typeof ROLES)[number];

export type UserPayload = {
  sub: string;
  // The User's name, copied into what the User records (an Inspection's inspector).
  name: string;
  organizationId: string;
  role: Role;
  internal: boolean;
};
