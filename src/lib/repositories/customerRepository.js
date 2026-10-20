/**
 * Customer Repository
 * Handles all customer-related API calls to Paystack
 */

import { getPaystackClient } from '../paystackClient.js';
import { CustomerAdapter } from '../adapters/customerAdapter.js';

class CustomerRepository {
  constructor(client = null) {
    this.client = client || getPaystackClient();
  }

  /**
   * List all customers with optional filters
   * @param {Object} filters - Query parameters for filtering
   * @param {number} filters.perPage - Number of results per page
   * @param {number} filters.page - Page number to retrieve
   * @returns {Promise<Object>} Paginated customer list
   */
  async listCustomers(filters = {}) {
    const response = await this.client.get('/customer', filters);

    return {
      data: CustomerAdapter.fromPaystackArray(response.data),
      meta: CustomerAdapter.extractPagination(response),
      status: response.status,
      message: response.message,
    };
  }

  /**
   * Get a single customer by ID, customer code or email
   * @param {string} id - Customer ID, customer code (CUS_xxx) or email
   * @returns {Promise<Object>} Customer details
   */
  async getCustomer(id) {
    const response = await this.client.get(`/customer/${id}`);

    return {
      data: CustomerAdapter.fromPaystack(response.data),
      status: response.status,
      message: response.message,
    };
  }

  /**
   * Create a new customer
   * @param {Object} customerData - Customer data
   * @param {string} customerData.email - Customer email (required by Paystack)
   * @param {string} customerData.firstName - First name
   * @param {string} customerData.lastName - Last name
   * @param {string} [customerData.phone] - Phone number
   * @param {Object} [customerData.metadata] - Additional metadata
   * @returns {Promise<Object>} Created customer
   */
  async createCustomer(customerData) {
    const payload = CustomerAdapter.toPaystackCreate(customerData);
    const response = await this.client.post('/customer', payload);

    return {
      data: CustomerAdapter.fromPaystack(response.data),
      status: response.status,
      message: response.message,
    };
  }

  /**
   * Update an existing customer
   * @param {string} id - Customer ID or customer code (CUS_xxx)
   * @param {Object} customerData - Fields to update
   * @returns {Promise<Object>} Updated customer
   */
  async updateCustomer(id, customerData) {
    const payload = CustomerAdapter.toPaystackUpdate(customerData);
    const response = await this.client.put(`/customer/${id}`, payload);

    return {
      data: CustomerAdapter.fromPaystack(response.data),
      status: response.status,
      message: response.message,
    };
  }

  /**
   * Search customers by query string
   * @param {string} query - Search query
   * @returns {Promise<Object>} Search results
   */
  async searchCustomers(query) {
    const response = await this.client.get('/customer', { search: query });

    return {
      data: CustomerAdapter.fromPaystackArray(response.data),
      meta: CustomerAdapter.extractPagination(response),
      status: response.status,
      message: response.message,
    };
  }
}

/**
 * Create a singleton instance of the customer repository
 */
let customerRepositoryInstance = null;

export function getCustomerRepository() {
  if (!customerRepositoryInstance) {
    customerRepositoryInstance = new CustomerRepository();
  }
  return customerRepositoryInstance;
}

/**
 * Create a new customer repository instance (for testing or custom config)
 */
export function createCustomerRepository(client) {
  return new CustomerRepository(client);
}

export default CustomerRepository;
