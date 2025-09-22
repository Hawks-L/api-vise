import { z } from 'zod';


export const purchaseSchema = z.object({
clientId: z.number().int().positive(),
amount: z.number().positive(),
currency: z.string().min(1),
purchaseDate: z.string().min(1), // se valida formato en runtime al calcular beneficios
purchaseCountry: z.string().min(1)
});