import { Client } from "../models/client";



// day: 0 Dom, 1 Lun, 2 Mar, 3 Mié, 4 Jue, 5 Vie, 6 Sáb (usando fecha en UTC)
export function computeBenefits(client: Client, amount: number, purchaseDateISO: string, purchaseCountry: string) {
const date = new Date(purchaseDateISO);
if (isNaN(date.getTime())) throw new Error('purchaseDate inválida (usar ISO 8601)');
const day = date.getUTCDay();


const isMonTueWed = day >= 1 && day <= 3;
const isWeekday = day >= 1 && day <= 5;
const isWeekend = day === 0 || day === 6;


let discount = 0;
let benefit = 'Sin beneficio aplicado';


switch (client.cardType) {
case 'Classic':
// sin beneficios
break;
case 'Gold':
if (isMonTueWed && amount > 100) {
discount = amount * 0.15;
benefit = 'Lun-Mar-Mié - Descuento 15%';
}
break;
case 'Platinum':
if (isMonTueWed && amount > 100) {
discount = amount * 0.20;
benefit = 'Lun-Mar-Mié - Descuento 20%';
} else if (day === 6 && amount > 200) {
discount = amount * 0.30;
benefit = 'Sábado - Descuento 30%';
} else if (purchaseCountry !== client.country) {
discount = amount * 0.05;
benefit = 'Compra exterior - Descuento 5%';
}
break;
case 'Black':
if (isMonTueWed && amount > 100) {
discount = amount * 0.25;
benefit = 'Lun-Mar-Mié - Descuento 25%';
} else if (day === 6 && amount > 200) {
discount = amount * 0.35;
benefit = 'Sábado - Descuento 35%';
} else if (purchaseCountry !== client.country) {
discount = amount * 0.05;
benefit = 'Compra exterior - Descuento 5%';
}
break;
case 'White':
if (isWeekday && amount > 100) {
discount = amount * 0.25;
benefit = 'Lun-Vie - Descuento 25%';
} else if (isWeekend && amount > 200) {
discount = amount * 0.35;
benefit = 'Sábado-Domingo - Descuento 35%';
} else if (purchaseCountry !== client.country) {
discount = amount * 0.05;
benefit = 'Compra exterior - Descuento 5%';
}
break;
}


return { discount, benefit };
}