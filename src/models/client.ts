import { CardType } from "./card";



export interface Client {
clientId: number;
name: string;
country: string; // país de residencia del cliente
monthlyIncome: number;
viseClub: boolean;
cardType: CardType;
}