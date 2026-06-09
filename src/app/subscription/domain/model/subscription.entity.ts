import { BaseEntity } from '@shared/infrastructure/base-entity';
import { Plan } from './plan.entity';

export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED';

export class Subscription implements BaseEntity {
  id: number;
  userId: string;
  planId: number;
  status: SubscriptionStatus;
  startDate: string;
  monthlyRequestCount: number;

  constructor(data: {
    id: number;
    userId: string;
    planId: number;
    status: SubscriptionStatus;
    startDate: string;
    monthlyRequestCount: number;
  }) {
    this.id = data.id;
    this.userId = data.userId;
    this.planId = data.planId;
    this.status = data.status;
    this.startDate = data.startDate;
    this.monthlyRequestCount = data.monthlyRequestCount;
  }

  isActive(): boolean {
    return this.status === 'ACTIVE';
  }

  canMakeRequest(plan: Plan): boolean {
    if (!this.isActive()) {
      return false;
    }
    if (plan.maxRequestsPerMonth === -1) {
      return true; // Unlimited
    }
    return this.monthlyRequestCount < plan.maxRequestsPerMonth;
  }

  isPremium(plan: Plan): boolean {
    return this.planId === plan.id && plan.isPremium();
  }
}
