import { InvestorRepository } from '../repositories/investor.repository';
import type {
  InvestorResponse,
  InvestorListResponse,
  InvestorFilters,
  CreateInvestorDTO,
  UpdateInvestorDTO,
} from '../types/investor.types';

export class InvestorService {
  static async getAll(filters: InvestorFilters): Promise<InvestorListResponse> {
    const { investors, total } = await InvestorRepository.findAllWithStats(filters);

    const investorsResponse: InvestorResponse[] = investors.map((investor) => ({
      id: investor.id,
      name: investor.name,
      profitPercentage: Number(investor.profitPercentage),
      isActive: investor.isActive,
      createdAt: investor.createdAt.toISOString(),
      activeLoansCount: investor.loans.length,
      totalInvested: investor.loans.reduce(
        (sum, loan) => sum + Number(loan.originalAmount),
        0
      ),
    }));

    return {
      investors: investorsResponse,
      total,
      page: filters.page ?? 1,
      pageSize: filters.pageSize ?? 50,
    };
  }

  static async getById(id: string): Promise<InvestorResponse> {
    const investor = await InvestorRepository.findByIdWithStats(id);

    if (!investor) {
      throw new Error('Inversor no encontrado');
    }

    return {
      id: investor.id,
      name: investor.name,
      profitPercentage: Number(investor.profitPercentage),
      isActive: investor.isActive,
      createdAt: investor.createdAt.toISOString(),
      activeLoansCount: investor.loans.filter((l) => !l.isSettled).length,
      totalInvested: investor.loans
        .filter((l) => !l.isSettled)
        .reduce((sum, loan) => sum + Number(loan.originalAmount), 0),
    };
  }

  static async create(data: CreateInvestorDTO): Promise<InvestorResponse> {
    const investor = await InvestorRepository.create(data);

    return {
      id: investor.id,
      name: investor.name,
      profitPercentage: Number(investor.profitPercentage),
      isActive: investor.isActive,
      createdAt: investor.createdAt.toISOString(),
      activeLoansCount: 0,
      totalInvested: 0,
    };
  }

  static async update(id: string, data: UpdateInvestorDTO): Promise<InvestorResponse> {
    const existing = await InvestorRepository.findById(id);
    if (!existing) {
      throw new Error('Inversor no encontrado');
    }

    const investor = await InvestorRepository.update(id, data);

    return {
      id: investor.id,
      name: investor.name,
      profitPercentage: Number(investor.profitPercentage),
      isActive: investor.isActive,
      createdAt: investor.createdAt.toISOString(),
    };
  }

  static async deactivate(id: string): Promise<InvestorResponse> {
    const existing = await InvestorRepository.findById(id);
    if (!existing) {
      throw new Error('Inversor no encontrado');
    }

    const investor = await InvestorRepository.deactivate(id);

    return {
      id: investor.id,
      name: investor.name,
      profitPercentage: Number(investor.profitPercentage),
      isActive: investor.isActive,
      createdAt: investor.createdAt.toISOString(),
    };
  }

  static async activate(id: string): Promise<InvestorResponse> {
    const existing = await InvestorRepository.findById(id);
    if (!existing) {
      throw new Error('Inversor no encontrado');
    }

    const investor = await InvestorRepository.activate(id);

    return {
      id: investor.id,
      name: investor.name,
      profitPercentage: Number(investor.profitPercentage),
      isActive: investor.isActive,
      createdAt: investor.createdAt.toISOString(),
    };
  }
}
