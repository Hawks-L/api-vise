import { CardType } from "../models/card";
import { Client } from "../models/client";


const PROHIBITED_COUNTRIES = ['China', 'Vietnam', 'India', 'Irán'];


export function isEligibleForCard(payload: Omit<Client, 'clientId'>): { ok: boolean; reason?: string } {
const { monthlyIncome, viseClub, country, cardType } = payload;


const reject = (reason: string) => ({ ok: false, reason });


switch (cardType) {
case 'Classic':
return { ok: true };
case 'Gold':
return monthlyIncome >= 500
? { ok: true }
: reject('Ingreso mínimo de 500 USD mensuales requerido para Gold');
case 'Platinum':
if (monthlyIncome < 1000) return reject('Ingreso mínimo de 1000 USD mensuales requerido para Platinum');
if (!viseClub) return reject('Suscripción VISE CLUB requerida para Platinum');
return { ok: true };
case 'Black':
case 'White':
if (monthlyIncome < 2000) return reject(`Ingreso mínimo de 2000 USD mensuales requerido para ${cardType}`);
if (!viseClub) return reject(`Suscripción VISE CLUB requerida para ${cardType}`);
if (PROHIBITED_COUNTRIES.includes(country)) return reject(`Clientes residentes en ${PROHIBITED_COUNTRIES.join(', ')} no son aptos para ${cardType}`);
return { ok: true };
default:
return reject('Tipo de tarjeta no soportado');
}
}


// Además del requisito de residencia, se bloquean compras desde países prohibidos para Black/White (coherencia con ejemplo de rechazo del enunciado)
export function canPurchaseInCountry(cardType: CardType, purchaseCountry: string): boolean {
if ((cardType === 'Black' || cardType === 'White') && PROHIBITED_COUNTRIES.includes(purchaseCountry)) {
return false;
}
return true;
}