import { z } from 'zod';


export const purchaseSchema = z.object({
clientId: z.number().int().positive(),
amount: z.number().positive(),
currency: z.string().min(1),
// Una fecha inválida llegaba hasta computeBenefits y terminaba en un error 500.
purchaseDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'purchaseDate inválida (usar ISO 8601)'),
purchaseCountry: z.string().min(1)
});