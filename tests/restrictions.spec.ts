import { canPurchaseInCountry, isEligibleForCard } from '../src/utils/restrictions';

const base = { name: 'Test', country: 'USA', monthlyIncome: 0, viseClub: false };

describe('Restricciones de elegibilidad', () => {
  it('Classic: cualquiera es apto', () => {
    expect(isEligibleForCard({ ...base, cardType: 'Classic' }).ok).toBe(true);
  });

  it('Gold: exige 500 USD mensuales', () => {
    expect(isEligibleForCard({ ...base, cardType: 'Gold', monthlyIncome: 499 }).ok).toBe(false);
    expect(isEligibleForCard({ ...base, cardType: 'Gold', monthlyIncome: 500 }).ok).toBe(true);
  });

  it('Platinum: exige 1000 USD y VISE CLUB', () => {
    expect(isEligibleForCard({ ...base, cardType: 'Platinum', monthlyIncome: 1000 }).ok).toBe(false);
    expect(isEligibleForCard({ ...base, cardType: 'Platinum', monthlyIncome: 1000, viseClub: true }).ok).toBe(true);
  });

  it.each(['Black', 'White'] as const)('%s: rechaza residentes de países prohibidos', (cardType) => {
    const apto = { ...base, cardType, monthlyIncome: 2000, viseClub: true };
    expect(isEligibleForCard(apto).ok).toBe(true);
    expect(isEligibleForCard({ ...apto, country: 'China' }).ok).toBe(false);
  });

  it('Black/White no pueden comprar desde países prohibidos; Classic sí', () => {
    expect(canPurchaseInCountry('Black', 'Irán')).toBe(false);
    expect(canPurchaseInCountry('Classic', 'Irán')).toBe(true);
  });
});
