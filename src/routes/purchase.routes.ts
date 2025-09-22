import { Router } from 'express';
import { postPurchase } from '../controllers/purchase.controller';
import { validateBody } from '../middleware/validate';
import { purchaseSchema } from '../schemas/purchase.schema';


const router = Router();
router.post('/', validateBody(purchaseSchema), postPurchase);
export default router;