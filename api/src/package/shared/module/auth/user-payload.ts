export type UserPayload = {
  sub: string;
  organizationId: string;
  role: 'administrator' | 'operator';
  internal: boolean;
};
