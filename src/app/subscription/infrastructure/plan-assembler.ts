import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Plan } from '../domain/model/plan.entity';
import { PlanResource, PlansResponse } from './subscription-response';

export class PlanAssembler extends BaseAssembler<Plan, PlanResource, PlansResponse> {
  toEntityFromResource(resource: PlanResource): Plan {
    return new Plan({
      id: resource.id,
      name: resource.name,
      description: resource.description,
      price: resource.price,
      maxRequestsPerMonth: resource.maxRequestsPerMonth,
      prioritySupport: resource.prioritySupport,
      isActive: resource.isActive
    });
  }

  toResourceFromEntity(entity: Plan): PlanResource {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      price: entity.price,
      maxRequestsPerMonth: entity.maxRequestsPerMonth,
      prioritySupport: entity.prioritySupport,
      isActive: entity.isActive
    };
  }

  toEntitiesFromResponse(response: PlansResponse): Plan[] {
    return response.plans.map(resource => this.toEntityFromResource(resource));
  }
}
