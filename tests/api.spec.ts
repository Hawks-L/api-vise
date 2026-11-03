import request from 'supertest';
import app from '../src/app';
import { __reset } from '../src/services/client.service';

beforeEach(() => __reset());

const platinum = { name: 'Ana', country: 'Colombia', monthlyIncome: 1500, viseClub: true, cardType: 'Platinum' };

describe('API VISE', () => {
  it('registra un cliente apto y aplica el beneficio del sábado', async () => {
    const alta = await request(app).post('/client').send(platinum);
    expect(alta.body.status).toBe('Registered');

    const compra = await request(app).post('/purchase').send({
      clientId: alta.body.clientId,
      amount: 300,
      currency: 'USD',
      purchaseDate: '2025-09-20T14:30:00Z',
      purchaseCountry: 'Colombia',
    });
    expect(compra.body.status).toBe('Approved');
    expect(compra.body.purchase.finalAmount).toBe(210);
  });

  it('rechaza bodies con tipos incorrectos', async () => {
    const res = await request(app).post('/client').send({ ...platinum, monthlyIncome: '1500' });
    expect(res.status).toBe(400);
    expect(res.body.status).toBe('Rejected');
  });

  it('rechaza una fecha inválida con 400 en vez de un error interno', async () => {
    const alta = await request(app).post('/client').send(platinum);
    const res = await request(app).post('/purchase').send({
      clientId: alta.body.clientId,
      amount: 300,
      currency: 'USD',
      purchaseDate: 'no-es-una-fecha',
      purchaseCountry: 'Colombia',
    });
    expect(res.status).toBe(400);
  });

  it('rechaza compras de clientes no registrados', async () => {
    const res = await request(app).post('/purchase').send({
      clientId: 999,
      amount: 50,
      currency: 'USD',
      purchaseDate: '2025-09-22T10:00:00Z',
      purchaseCountry: 'USA',
    });
    expect(res.body).toEqual({ status: 'Rejected', error: 'Cliente no registrado' });
  });
});
