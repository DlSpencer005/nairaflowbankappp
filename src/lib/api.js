
/**
 * API layer â€” all fetch functions used by React Query.
 * Integrated with Paystack API for real transaction processing.
 * Maintains MSW fallback for development when VITE_USE_MOCK=true.
 */

import { paystackConfig } from './config/paystackConfig.js';
import { getTransactionService } from './services/transactionService.js';
import { getCustomerService } from './services/customerService.js';

// Legacy MSW support (for development)
const BASE = '';
async function apiFetch(url, options) {
  const res = await fetch(`${BASE}${url}`, options);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

/**
 * Transaction API Functions
 * Integrated with Paystack API
 */

export async function fetchTransactions(filters = {}) {
  // Use Paystack API if not in mock mode
  if (!paystackConfig.useMock) {
    const transactionService = getTransactionService();
    const result = await transactionService.fetchTransactions(filters);
    return result.transactions;
  }
  
  // Fallback to MSW for development
  const data = await apiFetch('/api/transactions');
  return data.transactions;
}

export async function fetchTransaction(id) {
  if (!paystackConfig.useMock) {
    const transactionService = getTransactionService();
    return await transactionService.fetchTransaction(id);
  }
  
  // MSW fallback (implement if needed)
  return apiFetch(`/api/transactions/${id}`);
}

export async function verifyTransaction(reference) {
  if (!paystackConfig.useMock) {
    const transactionService = getTransactionService();
    return await transactionService.verifyTransaction(reference);
  }
  
  // MSW fallback
  return apiFetch(`/api/transactions/verify/${reference}`);
}

export async function initializeTransaction(transactionData) {
  if (!paystackConfig.useMock) {
    const transactionService = getTransactionService();
    return await transactionService.initializeTransaction(transactionData);
  }
  
  // MSW fallback
  return apiFetch('/api/transactions/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transactionData),
  });
}

/**
 * Customer API Functions
 * Integrated with Paystack API (POST/PUT /customer)
 */

export async function fetchCustomers(filters = {}) {
  // Use Paystack API if not in mock mode
  if (!paystackConfig.useMock) {
    const customerService = getCustomerService();
    const result = await customerService.fetchCustomers(filters);
    return result.customers;
  }

  // Fallback to MSW for development
  const data = await apiFetch('/api/customers');
  return data.customers;
}

export async function fetchCustomer(id) {
  if (!paystackConfig.useMock) {
    const customerService = getCustomerService();
    return await customerService.fetchCustomer(id);
  }

  // MSW fallback
  return apiFetch(`/api/customers/${id}`);
}

export async function createCustomer(customerData) {
  if (!paystackConfig.useMock) {
    const customerService = getCustomerService();
    return await customerService.createCustomer(customerData);
  }

  // MSW fallback
  const data = await apiFetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData),
  });
  return data.customer;
}

export async function updateCustomer(id, customerData) {
  if (!paystackConfig.useMock) {
    const customerService = getCustomerService();
    return await customerService.updateCustomer(id, customerData);
  }

  // MSW fallback
  const data = await apiFetch(`/api/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customerData),
  });
  return data.customer;
}

/**
 * Balance API Functions
 * Currently using MSW, to be integrated with Paystack in future phases
 */

export async function fetchBalance() {
  // Paystack doesn't have a direct balance API
  // This will be implemented with custom backend service
  // For now, use MSW
  return apiFetch('/api/balance');
}

/**
 * Transfer API Functions
 * Will be integrated with Paystack in Phase 4
 */

export async function sendTransfer(transferData) {
  // Paystack transfer integration coming in Phase 4
  // For now, use MSW
  return apiFetch('/api/transfers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transferData),
  });
}

/**
 * Savings API Functions
 * Currently using MSW, to be integrated with Paystack plans in Phase 5
 */

export async function fetchSavings() {
  // Will be integrated with Paystack plans in Phase 5
  const data = await apiFetch('/api/savings');
  return data.plans;
}

/**
 * Exchange Rate API Functions
 * Currently using MSW, to be integrated with Paystack or external API
 */

export async function fetchRates() {
  const data = await apiFetch('/api/rates');
  return data;
}

/**
 * Insights API Functions
 * Currently using MSW, to be integrated with transaction statistics
 */

export async function fetchInsights() {
  // Can be implemented using Paystack transaction statistics
  const data = await apiFetch('/api/insights');
  return data.insights;
}

/**
 * Transaction Statistics
 * New function using Paystack API
 */

export async function fetchTransactionStatistics(filters = {}) {
  if (!paystackConfig.useMock) {
    const transactionService = getTransactionService();
    return await transactionService.getTransactionStatistics(filters);
  }
  
  // MSW fallback
  return apiFetch('/api/transactions/statistics');
}