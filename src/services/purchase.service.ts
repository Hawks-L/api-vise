import { findClient } from './client.service';
import { canPurchaseInCountry } from '../utils/restrictions';
import { computeBenefits } from '../utils/benefits';
import { PurchaseInput, PurchaseResult } from '../models/purchase';


export function processPurchase(input: PurchaseInput): PurchaseResult {
const client = findClient(input.clientId);
if (!client) {
return { status: 'Rejected', error: 'Cliente no registrado' };
}


if (!canPurchaseInCountry(client.cardType, input.purchaseCountry)) {
return { status: 'Rejected', error: `El cliente con tarjeta ${client.cardType} no puede realizar compras desde ${input.purchaseCountry}` };
}


const { discount, benefit } = computeBenefits(client, input.amount, input.purchaseDate, input.purchaseCountry);


return {
status: 'Approved',
purchase: {
clientId: input.clientId,
originalAmount: input.amount,
discountApplied: Number(discount.toFixed(2)),
finalAmount: Number((input.amount - discount).toFixed(2)),
benefit
}
};
}