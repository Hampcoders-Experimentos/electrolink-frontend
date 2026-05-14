export interface HomeOwnerConsumption {
  ownerId?: number;
  month: string;
  year?: number;
  energyConsumed: number;
  amountPaid: number;
  serviceRequestsCount?: number;
}

export interface TechnicianPerformance {
  technicianId?: number;
  totalServicesCompleted: number;
  averageRating: number;
  averageCompletionTimeHours?: number;
  pendingServices?: number;
}

export interface RecentService {
  date: string;
  clientName: string;
  amount: number;
}

export interface TechnicianRevenue {
  technicianId?: number;
  period: string;
  totalRevenue: number;
  servicesCount?: number;
  averageRevenuePerService?: number;
  recentServices?: RecentService[];
}
