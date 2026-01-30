import { CustomerRepository } from '../repositories/customer.repository';
import type { CustomerDTO, CustomerResponse, CustomerListResponse, CustomerFilters } from '../types/customer.types';

export class CustomerService {
  static async getAll(filters: CustomerFilters): Promise<CustomerListResponse> {
    const { customers, total } = await CustomerRepository.findAll(filters);
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 20;

    const customerIds = customers.map((c) => c.id);
    const statsMap = await CustomerRepository.getAllCustomerStats(customerIds);

    const customersWithStats = customers.map((customer) => {
      const stats = statsMap.get(customer.id) ?? { activeLoansCount: 0, totalOwed: 0 };
      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        notes: customer.notes,
        isActive: customer.isActive,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        activeLoansCount: stats.activeLoansCount,
        totalOwed: stats.totalOwed,
      };
    });

    return {
      customers: customersWithStats,
      total,
      page,
      pageSize,
    };
  }

  static async getById(id: string): Promise<CustomerResponse> {
    const customer = await CustomerRepository.findById(id);
    if (!customer) {
      throw new Error('Cliente no encontrado');
    }

    const stats = await CustomerRepository.getCustomerStats(id);

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      notes: customer.notes,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      activeLoansCount: stats.activeLoansCount,
      totalOwed: stats.totalOwed,
    };
  }

  static async getByIdWithLoans(id: string) {
    const customer = await CustomerRepository.findByIdWithLoans(id);
    if (!customer) {
      throw new Error('Cliente no encontrado');
    }
    return customer;
  }

  static async create(data: CustomerDTO): Promise<CustomerResponse> {
    const customer = await CustomerRepository.create(data);

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      notes: customer.notes,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      activeLoansCount: 0,
      totalOwed: 0,
    };
  }

  static async update(id: string, data: Partial<CustomerDTO>): Promise<CustomerResponse> {
    const existing = await CustomerRepository.findById(id);
    if (!existing) {
      throw new Error('Cliente no encontrado');
    }

    const customer = await CustomerRepository.update(id, data);
    const stats = await CustomerRepository.getCustomerStats(id);

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      notes: customer.notes,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      activeLoansCount: stats.activeLoansCount,
      totalOwed: stats.totalOwed,
    };
  }

  static async deactivate(id: string): Promise<CustomerResponse> {
    const existing = await CustomerRepository.findById(id);
    if (!existing) {
      throw new Error('Cliente no encontrado');
    }

    const stats = await CustomerRepository.getCustomerStats(id);
    if (stats.activeLoansCount > 0) {
      throw new Error('No se puede desactivar un cliente con prestamos activos');
    }

    const customer = await CustomerRepository.deactivate(id);

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      notes: customer.notes,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      activeLoansCount: stats.activeLoansCount,
      totalOwed: stats.totalOwed,
    };
  }

  static async activate(id: string): Promise<CustomerResponse> {
    const existing = await CustomerRepository.findById(id);
    if (!existing) {
      throw new Error('Cliente no encontrado');
    }

    const customer = await CustomerRepository.activate(id);
    const stats = await CustomerRepository.getCustomerStats(id);

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      notes: customer.notes,
      isActive: customer.isActive,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      activeLoansCount: stats.activeLoansCount,
      totalOwed: stats.totalOwed,
    };
  }
}
