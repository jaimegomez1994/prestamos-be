export interface CustomerDTO {
  name: string;
  phone?: string;
  notes?: string;
}

export interface CustomerResponse {
  id: string;
  name: string;
  phone: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  activeLoansCount?: number;
  totalOwed?: number;
}

export interface CustomerListResponse {
  customers: CustomerResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CustomerFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}
