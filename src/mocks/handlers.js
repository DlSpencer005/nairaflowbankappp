/**
 * MSW Handlers — mock API endpoints for the NairaFlow fintech dashboard.
 * These intercept fetch() at the network level.
 */
import { http, HttpResponse, delay } from 'msw';
import { generateTransactions, SAVINGS_PLANS, EXCHANGE_RATES } from './data';

// Bank code to name mapping (matches the grouped list in SendMoneyForm.jsx)
const BANK_NAMES = {
  // Commercial Banks
  '101': 'GTBank',
  '044': 'Access Bank',
  '401': 'Zenith Bank',
  '501': 'UBA',
  '012': 'Fidelity Bank',
  '103': 'Kuda Bank',
  '050': 'Ecobank',
  '011': 'First Bank of Nigeria',
  '032': 'Union Bank of Nigeria',
  '076': 'Polaris Bank',
  '082': 'Keystone Bank',
  '035': 'Wema Bank',
  '232': 'Sterling Bank',
  '221': 'Stanbic IBTC Bank',
  '215': 'Unity Bank',
  '301': 'Jaiz Bank',
  // Digital Banks
  '201': 'OPay',
  '100': 'Providus Bank',
  '313': 'Titan Trust Bank',
  '503': 'VFD Microfinance Bank',
};

function getBankName(code) {
  return BANK_NAMES[code] || `${code}`;
}

// Generate a stable set of transactions (refreshed per session)
let cachedTransactions = generateTransactions(15);

// Track dynamic balance (in kobo - starts at 2,450,000 NGN = 245,000,000 kobo)
let currentBalance = 245000000;

// Seed customers (app format — mirrors CustomerAdapter output)
let cachedCustomers = [
  {
    id: 1001,
    customer_code: 'CUS_a1b2c3d4',
    email: 'ada.obi@email.com',
    firstName: 'Ada',
    lastName: 'Obi',
    phone: '08031234567',
    metadata: {},
    risk_action: 'default',
    international_phone_format: '+234 803 123 4567',
    createdAt: '2026-01-12T09:24:00.000Z',
    updatedAt: '2026-01-12T09:24:00.000Z',
    fullName: 'Ada Obi',
    initial: 'AO',
  },
  {
    id: 1002,
    customer_code: 'CUS_e5f6g7h8',
    email: 'musa.bello@email.com',
    firstName: 'Musa',
    lastName: 'Bello',
    phone: '08098765432',
    metadata: {},
    risk_action: 'allow',
    international_phone_format: '+234 809 876 5432',
    createdAt: '2026-02-03T14:10:00.000Z',
    updatedAt: '2026-02-03T14:10:00.000Z',
    fullName: 'Musa Bello',
    initial: 'MB',
  },
  {
    id: 1003,
    customer_code: 'CUS_i9j0k1l2',
    email: 'chiamaka.okafor@email.com',
    firstName: 'Chiamaka',
    lastName: 'Okafor',
    phone: '07011223344',
    metadata: {},
    risk_action: 'default',
    international_phone_format: '+234 701 122 3344',
    createdAt: '2026-03-21T18:45:00.000Z',
    updatedAt: '2026-03-21T18:45:00.000Z',
    fullName: 'Chiamaka Okafor',
    initial: 'CO',
  },
];

let nextCustomerId = 1004;

export const handlers = [
  // ─── GET /api/balance ───
  http.get('/api/balance', async () => {
    await delay(600);
    if (Math.random() < 0.05) return new HttpResponse(null, { status: 500 });
    return HttpResponse.json({
      amount: currentBalance,
      currency: 'NGN',
      trend: 12,
    });
  }),

  // ─── GET /api/transactions ───
  http.get('/api/transactions', async () => {
    await delay(800);
    if (Math.random() < 0.08) return new HttpResponse(null, { status: 500 });
    return HttpResponse.json({ transactions: cachedTransactions });
  }),

  // ─── POST /api/transfers ───
  http.post('/api/transfers', async ({ request }) => {
    await delay(1500);
    if (Math.random() < 0.1) {
      return HttpResponse.json(
        { error: 'Transfer failed. Please try again.' },
        { status: 500 }
      );
    }
    const body = await request.json();
    const amountInKobo = Number(body.amount) * 100;
    const transferFee = 15000; // 150 NGN fee in kobo
    const currency = body.currency || 'NGN';

    // Calculate total deduction from balance
    let totalDeduction = amountInKobo + transferFee;

    // For international transfers, convert to NGN equivalent (future enhancement)
    if (currency !== 'NGN') {
      // Import EXCHANGE_RATES for conversion
      // For now, we'll handle international transfers similarly but note this is for future
      // TODO: Implement proper currency conversion using EXCHANGE_RATES
    }

    // Deduct from balance (only if sufficient funds)
    if (currentBalance >= totalDeduction) {
      currentBalance -= totalDeduction;
    } else {
      return HttpResponse.json(
        { error: 'Insufficient funds for this transfer.' },
        { status:  400 }
      );
    }

    const newTx = {
      id: `tx-${Date.now()}`,
      description: body.narration || `Transfer to ${body.accountNumber}`,
      amount: amountInKobo,
      currency: currency,
      status: 'success',
      bank: getBankName(body.bankCode) || 'GTBank', // Store bank name instead of code
      account: body.accountNumber,
      date: new Date().toISOString(),
      fee: transferFee,
    };
    cachedTransactions = [newTx, ...cachedTransactions];
    return HttpResponse.json({
      success: true,
      reference: `NF-${Date.now()}`,
      amount: newTx.amount,
      recipient: body.accountNumber,
      newBalance: currentBalance, // Include updated balance in response
    });
  }),

  // ─── GET /api/savings ───
  http.get('/api/savings', async () => {
    await delay(600);
    return HttpResponse.json({ plans: SAVINGS_PLANS });
  }),

  // ─── GET /api/rates ───
  http.get('/api/rates', async () => {
    await delay(400);
    return HttpResponse.json({
      rates: EXCHANGE_RATES,
      lastUpdated: new Date().toISOString(),
    });
  }),

  // ─── GET /api/insights ───
  http.get('/api/insights', async () => {
    await delay(700);
    return HttpResponse.json({
      insights: [
        { id: 1, icon: '📊', headline: 'Spending up 12%', detail: 'Your spending is up 12% this month, mostly on data subscriptions.', confidence: 0.87 },
        { id: 2, icon: '🎯', headline: 'Savings on track', detail: 'Your Fixed Deposit is on track to hit ₦5,000,000 by December.', confidence: 0.92 },
        { id: 3, icon: '💡', headline: 'Airtime tip', detail: 'You spent ₦45,000 on airtime this month — 20% above average.', confidence: 0.78 },
      ],
    });
  }),

  // ─── GET /api/customers ───
  http.get('/api/customers', async () => {
    await delay(600);
    return HttpResponse.json({ customers: cachedCustomers });
  }),

  // ─── GET /api/customers/:id ───
  http.get('/api/customers/:id', async ({ params }) => {
    await delay(400);
    const customer = cachedCustomers.find(
      c => String(c.id) === String(params.id) || c.customer_code === params.id || c.email === params.id
    );
    if (!customer) {
      return HttpResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    return HttpResponse.json({ customer });
  }),

  // ─── POST /api/customers ───
  http.post('/api/customers', async ({ request }) => {
    await delay(900);
    const body = await request.json();

    if (cachedCustomers.some(c => c.email.toLowerCase() === body.email?.toLowerCase())) {
      return HttpResponse.json(
        { error: 'A customer with this email already exists.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newCustomer = {
      id: nextCustomerId++,
      customer_code: `CUS_${Date.now().toString(36)}`,
      email: body.email,
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      phone: body.phone || '',
      metadata: body.metadata || {},
      risk_action: 'default',
      international_phone_format: body.phone ? `+234 ${body.phone}` : '',
      createdAt: now,
      updatedAt: now,
      fullName: `${body.firstName || ''} ${body.lastName || ''}`.trim(),
      initial: `${(body.firstName || '?').charAt(0)}${(body.lastName || '').charAt(0)}`.toUpperCase(),
    };
    cachedCustomers = [newCustomer, ...cachedCustomers];
    return HttpResponse.json({ success: true, customer: newCustomer }, { status: 201 });
  }),

  // ─── PUT /api/customers/:id ───
  http.put('/api/customers/:id', async ({ params, request }) => {
    await delay(900);
    const body = await request.json();
    const index = cachedCustomers.findIndex(
      c => String(c.id) === String(params.id) || c.customer_code === params.id
    );
    if (index === -1) {
      return HttpResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const existing = cachedCustomers[index];
    const updated = {
      ...existing,
      email: body.email ?? existing.email,
      firstName: body.firstName ?? existing.firstName,
      lastName: body.lastName ?? existing.lastName,
      phone: body.phone ?? existing.phone,
      fullName: `${body.firstName ?? existing.firstName} ${body.lastName ?? existing.lastName}`.trim(),
      initial: `${(body.firstName ?? existing.firstName).charAt(0)}${(body.lastName ?? existing.lastName).charAt(0)}`.toUpperCase(),
      updatedAt: new Date().toISOString(),
    };
    cachedCustomers = cachedCustomers.map((c, i) => (i === index ? updated : c));
    return HttpResponse.json({ success: true, customer: updated });
  }),
];
