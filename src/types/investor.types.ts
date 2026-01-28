export interface InvestorResponse {
  id: string;
  name: string;
  profitPercentage: number;
  isActive: boolean;
}

export interface InvestorListResponse {
  investors: InvestorResponse[];
}
