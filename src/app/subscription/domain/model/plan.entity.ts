import { BaseEntity } from '@shared/infrastructure/base-entity';

export type PlanName = 'BASIC' | 'PREMIUM';

export class Plan implements BaseEntity {
  id: number;
  name: PlanName;
  description: string;
  price: number;
  maxRequestsPerMonth: number;
  prioritySupport: boolean;
  isActive: boolean;

  constructor(data: {
    id: number;
    name: PlanName;
    description: string;
    price: number;
    maxRequestsPerMonth: number;
    prioritySupport: boolean;
    isActive?: boolean;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.maxRequestsPerMonth = data.maxRequestsPerMonth;
    this.prioritySupport = data.prioritySupport;
    this.isActive = data.isActive ?? true;
  }

  isFree(): boolean {
    return this.price === 0;
  }

  isPremium(): boolean {
    return this.name === 'PREMIUM';
  }
}
