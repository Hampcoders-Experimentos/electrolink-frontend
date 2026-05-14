import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { ServiceOperation } from '../domain/model/service-operation.entity';
import { ServiceOperationResource, ServiceOperationsResponse } from './service-operation-response';

export class ServiceOperationAssembler extends BaseAssembler<ServiceOperation, ServiceOperationResource, ServiceOperationsResponse> {
  
  toEntityFromResource(resource: ServiceOperationResource): ServiceOperation {
    return new ServiceOperation({
      id: resource.id,
      requestId: resource.requestId,
      technicianId: resource.technicianId,
      status: resource.status,
      startedAt: resource.startedAt ? new Date(resource.startedAt) : undefined,
      completedAt: resource.completedAt ? new Date(resource.completedAt) : undefined
    });
  }

  toResourceFromEntity(entity: ServiceOperation): ServiceOperationResource {
    return {
      id: entity.id,
      requestId: entity.requestId,
      technicianId: entity.technicianId,
      status: entity.status,
      startedAt: entity.startedAt.toISOString(),
      completedAt: entity.completedAt ? entity.completedAt.toISOString() : undefined
    };
  }

  toEntitiesFromResponse(response: ServiceOperationsResponse): ServiceOperation[] {
    if (!response || !response.serviceOperations) {
      return [];
    }
    return response.serviceOperations.map(resource => this.toEntityFromResource(resource));
  }
}
