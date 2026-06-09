import { BaseAssembler } from '@shared/infrastructure/base-assembler';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionResource, SubscriptionsResponse } from './subscription-response';

export class SubscriptionAssembler extends BaseAssembler<Subscription, SubscriptionResource, SubscriptionsResponse> {
  toEntityFromResource(resource: SubscriptionResource): Subscription {
    return new Subscription({
      id: resource.id,
      userId: resource.userId,
      planId: resource.planId,
      status: resource.status,
      startDate: resource.startDate,
      monthlyRequestCount: resource.monthlyRequestCount
    });
  }

  toResourceFromEntity(entity: Subscription): SubscriptionResource {
    return {
      id: entity.id,
      userId: entity.userId,
      planId: entity.planId,
      status: entity.status,
      startDate: entity.startDate,
      monthlyRequestCount: entity.monthlyRequestCount
    };
  }

  toEntitiesFromResponse(response: SubscriptionsResponse): Subscription[] {
    return response.subscriptions.map(resource => this.toEntityFromResource(resource));
  }
}
