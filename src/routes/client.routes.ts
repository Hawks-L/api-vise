import { Router } from 'express';
import { postClient } from '../controllers/client.controller';
import { validateBody } from '../middleware/validate';
import { createClientSchema } from '../schemas/client.schema';


const router = Router();
router.post('/', validateBody(createClientSchema), postClient);
export default router;