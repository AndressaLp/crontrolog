import { z } from 'zod';

export const listMinhasRotasQuerySchema = z.object({
  status: z.enum(['ATIVA', 'CONCLUIDA', 'CANCELADA']).optional(),
});
