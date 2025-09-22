import { computeBenefits } from '../src/utils/benefits';


const baseClient = {
clientId: 1,
name: 'Test',
country: 'USA',
monthlyIncome: 3000,
viseClub: true,
cardType: 'Black' as const
};


// Sábado 2025-09-20 14:30:00Z
const saturdayISO = '2025-09-20T14:30:00Z';


describe('Benefits', () => {
it('Black: sábado > 200 => 35%', () => {
const { discount, benefit } = computeBenefits({ ...baseClient }, 250, saturdayISO, 'USA');
expect(benefit).toMatch('35%');
expect(Number(discount.toFixed(2))).toBe(87.5);
});


it('Black: exterior 5% si no aplica otro beneficio', () => {
const { discount, benefit } = computeBenefits({ ...baseClient }, 90, saturdayISO, 'France');
expect(benefit).toMatch('5%');
expect(Number(discount.toFixed(2))).toBe(4.5);
});
});