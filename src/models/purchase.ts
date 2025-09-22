export interface PurchaseInput {
clientId: number;
amount: number;
currency: string; // se asume ISO (ej. USD)
purchaseDate: string; // ISO 8601
purchaseCountry: string; // país donde se realiza la compra
}


export interface PurchaseResult {
status: 'Approved' | 'Rejected';
purchase?: {
clientId: number;
originalAmount: number;
discountApplied: number;
finalAmount: number;
benefit: string;
};
error?: string;
}