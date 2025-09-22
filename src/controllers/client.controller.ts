import { Request, Response } from 'express';
import { registerClient } from '../services/client.service';


export function postClient(req: Request, res: Response) {
const result = registerClient(req.body);
if (!result.ok) {
return res.status(200).json({ status: 'Rejected', error: result.error });
}
const { client } = result;
return res.json({
clientId: client.clientId,
name: client.name,
cardType: client.cardType,
status: 'Registered',
message: `Cliente apto para tarjeta ${client.cardType}`
});
}