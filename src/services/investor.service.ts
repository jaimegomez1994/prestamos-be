import { InvestorRepository } from '../repositories/investor.repository';
import type { InvestorResponse, InvestorListResponse } from '../types/investor.types';

export class InvestorService {
  static async getAll(activeOnly = true): Promise<InvestorListResponse> {
    const investors = await InvestorRepository.findAll(activeOnly);

    const investorsResponse: InvestorResponse[] = investors.map((investor) => ({
      id: investor.id,
      name: investor.name,
      profitPercentage: Number(investor.profitPercentage),
      isActive: investor.isActive,
    }));

    return { investors: investorsResponse };
  }
}
