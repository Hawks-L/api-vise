import { z } from 'zod';


export const createClientSchema = z.object({
name: z.string().min(1),
country: z.string().min(1),
monthlyIncome: z.number().nonnegative(),
viseClub: z.boolean(),
cardType: z.enum(['Classic', 'Gold', 'Platinum', 'Black', 'White'])
});