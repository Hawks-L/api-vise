
import { Client } from '../models/client';
import { isEligibleForCard } from '../utils/restrictions';


let clients: Client[] = [];
let seq = 1;


export function registerClient(payload: Omit<Client, 'clientId'>) {
const eligibility = isEligibleForCard(payload);
if (!eligibility.ok) {
return { ok: false as const, error: eligibility.reason! };
}


const client: Client = { clientId: seq++, ...payload };
clients.push(client);
return { ok: true as const, client };
}


export function findClient(id: number): Client | undefined {
return clients.find(c => c.clientId === id);
}


// Utilidad para tests
export function __reset() { clients = []; seq = 1; }