import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { RequestEntity, RequestPriority, RequestStatus } from '../domain/model/request.entity';
import { RequestResource, RequestsResponse } from './request-response';

export class RequestAssembler extends BaseAssembler<RequestEntity, RequestResource, RequestsResponse> {

  toEntityFromResource(resource: RequestResource): RequestEntity {
    return new RequestEntity({
      id: resource.id,
      homeownerId: resource.homeownerId,
      propertyId: resource.propertyId,
      serviceId: resource.serviceId,
      description: resource.description,
      requiresBill: resource.requiresBill,
      priority: resource.priority as RequestPriority,
      status: resource.status as RequestStatus,
      assignedTechnicianId: resource.assignedTechnicianId
    });
  }

  toResourceFromEntity(entity: RequestEntity): RequestResource {
    return {
      id: entity.id,
      homeownerId: entity.homeownerId,
      propertyId: entity.propertyId,
      serviceId: entity.serviceId,
      description: entity.description,
      requiresBill: entity.requiresBill,
      priority: entity.priority,
      status: entity.status,
      assignedTechnicianId: entity.assignedTechnicianId
    };
  }

  toEntitiesFromResponse(response: RequestsResponse): RequestEntity[] {
    return response.requests.map(resource => this.toEntityFromResource(resource));
  }
}
