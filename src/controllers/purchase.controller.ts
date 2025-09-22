import { Request, Response } from 'express';
import { processPurchase } from '../services/purchase.service';


export function postPurchase(req: Request, res: Response) {
const result = processPurchase(req.body);
if (result.status === 'Rejected') return res.status(200).json(result);
return res.json(result);
}