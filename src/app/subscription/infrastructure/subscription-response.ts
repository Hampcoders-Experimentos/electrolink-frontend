import { BaseResource, BaseResponse } from '@shared/infrastructure/base-response';

export interface PlanResource extends BaseResource {
  id: number;
  name: 'BASIC' | 'PREMIUM';
  description: string;
  price: number;
  maxRequestsPerMonth: number;
  prioritySupport: boolean;
  isActive: boolean;
}

export interface SubscriptionResource extends BaseResource {
  id: number;
  userId: string;
  planId: number;
  status: 'ACTIVE' | 'CANCELLED';
  startDate: string;
  monthlyRequestCount: number;
}

export interface CreateSubscriptionResource {
  userId: string;
  planId: number;
  status: 'ACTIVE' | 'CANCELLED';
  startDate: string;
  monthlyRequestCount: number;
}

export interface PlansResponse extends BaseResponse {
  plans: PlanResource[];
}

export interface SubscriptionsResponse extends BaseResponse {
  subscriptions: SubscriptionResource[];
}
