import { Injectable } from '@angular/core';
import { BaseApi } from '@shared/infrastructure/base-api';
import { PlansApiEndpoint } from './plans-api-endpoint';
import { SubscriptionsApiEndpoint } from './subscriptions-api-endpoint';
import { Plan } from '../domain/model/plan.entity';
import { Subscription } from '../domain/model/subscription.entity';
import { CreateSubscriptionResource, SubscriptionResource } from './subscription-response';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SubscriptionApiService extends BaseApi {
  constructor(
    private plansEndpoint: PlansApiEndpoint,
    private subscriptionsEndpoint: SubscriptionsApiEndpoint
  ) {
    super();
  }

  // --- Plans ---
  getPlans(): Observable<Plan[]> {
    return this.plansEndpoint.getAll();
  }

  getPlanById(id: number): Observable<Plan> {
    return this.plansEndpoint.getById(id);
  }

  // --- Subscriptions ---
  getSubscriptionsByUserId(userId: string): Observable<Subscription[]> {
    return this.subscriptionsEndpoint.getByUserId(userId);
  }

  createSubscription(resource: CreateSubscriptionResource): Observable<Subscription> {
    return this.subscriptionsEndpoint.createFromResource(resource);
  }

  updateSubscription(resource: SubscriptionResource, id: number): Observable<Subscription> {
    return this.subscriptionsEndpoint.updateFromResource(resource, id);
  }

  deleteSubscription(id: number): Observable<void> {
    return this.subscriptionsEndpoint.delete(id);
  }
}
