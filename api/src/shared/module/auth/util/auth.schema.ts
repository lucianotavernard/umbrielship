import z from 'zod';

export const accestTokenPayloadSchema = z.object({
  sub: z.uuid(),
});
