export interface CreateInvestorDTO {
  name: string;
  profitPercentage?: number;
}

export interface UpdateInvestorDTO {
  name?: string;
  profitPercentage?: number;
}

export interface InvestorResponse {
  id: string;
  name: string;
  profitPercentage: number;
  isActive: boolean;
  createdAt: string;
  activeLoansCount?: number;
  totalInvested?: number;
}

export interface InvestorListResponse {
  investors: InvestorResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface InvestorFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}
