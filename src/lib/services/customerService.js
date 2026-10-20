/**
 * Customer Service
 * Business logic layer for customer operations
 */

import { getCustomerRepository } from '../repositories/customerRepository.js';
import { CustomerAdapter } from '../adapters/customerAdapter.js';
import {
  validateCustomerCreate,
  validateCustomerUpdate,
  validateCustomerFilters,
  formatValidationErrors,
} from '../validators/customerValidator.js';

class CustomerService {
  constructor(repository = null) {
    this.repository = repository || getCustomerRepository();
  }

  /**
   * Fetch all customers with optional filtering
   * @param {Object} filters - Filter options
   * @param {string} filters.search - Free-text search (name, email, code)
   * @param {number} filters.perPage - Results per page
   * @param {number} filters.page - Page number
   * @returns {Promise<Object>} Filtered customers with pagination
   */
  async fetchCustomers(filters = {}) {
    try {
      const { search, ...query } = filters;

      const validation = validateCustomerFilters(query);
      if (!validation.success) {
        throw new Error(formatValidationErrors(validation.errors)[0]?.message || 'Invalid filters');
      }

      const response = await this.repository.listCustomers(query);

      let customers = response.data;
      if (search) {
        customers = CustomerAdapter.search(customers, search);
      }

      return {
        customers,
        pagination: response.meta,
      };
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  /**
   * Fetch a single customer by ID, customer code or email
   * @param {string} id - Customer ID, customer code or email
   * @returns {Promise<Object>} Customer details
   */
  async fetchCustomer(id) {
    try {
      const response = await this.repository.getCustomer(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  /**
   * Create a new customer
   * @param {Object} customerData - Customer data (email, firstName, lastName, phone)
   * @returns {Promise<Object>} Created customer
   */
  async createCustomer(customerData) {
    try {
      const validation = validateCustomerCreate(customerData);
      if (!validation.success) {
        const errors = formatValidationErrors(validation.errors);
        throw new Error(errors[0]?.message || 'Invalid customer data');
      }

      const response = await this.repository.createCustomer(validation.data);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Update an existing customer
   * @param {string} id - Customer ID or customer code (CUS_xxx)
   * @param {Object} customerData - Fields to update
   * @returns {Promise<Object>} Updated customer
   */
  async updateCustomer(id, customerData) {
    try {
      if (!id) {
        throw new Error('Customer ID is required for updates');
      }

      const validation = validateCustomerUpdate(customerData);
      if (!validation.success) {
        const errors = formatValidationErrors(validation.errors);
        throw new Error(errors[0]?.message || 'Invalid customer data');
      }

      const response = await this.repository.updateCustomer(id, validation.data);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  /**
   * Search customers by free-text query
   * @param {string} query - Search query
   * @returns {Promise<Object>} Search results
   */
  async searchCustomers(query) {
    try {
      const response = await this.repository.searchCustomers(query);
      return {
        customers: response.data,
        count: response.data.length,
      };
    } catch (error) {
      console.error('Error searching customers:', error);
      throw error;
    }
  }
}

/**
 * Create a singleton instance of the customer service
 */
let customerServiceInstance = null;

export function getCustomerService() {
  if (!customerServiceInstance) {
    customerServiceInstance = new CustomerService();
  }
  return customerServiceInstance;
}

/**
 * Create a new customer service instance (for testing or custom config)
 */
export function createCustomerService(repository) {
  return new CustomerService(repository);
}

export default CustomerService;
