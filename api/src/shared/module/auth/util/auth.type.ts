import { z } from 'zod';

import { accestTokenPayloadSchema } from './auth.schema';

export type AccessTokenPayload = z.infer<typeof accestTokenPayloadSchema>;
