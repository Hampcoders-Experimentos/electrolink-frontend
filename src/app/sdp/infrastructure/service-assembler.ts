import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { ServiceEntity } from '../domain/model/service.entity';
import { ServiceResource, ServicesResponse } from './service-response';

export class ServiceAssembler extends BaseAssembler<ServiceEntity, ServiceResource, ServicesResponse> {

  toEntityFromResource(resource: ServiceResource): ServiceEntity {
    return new ServiceEntity({
      id: resource.id,
      name: resource.name,
      description: resource.description,
      basePrice: resource.basePrice,
      category: resource.category,
      imageUrl: resource.imageUrl
    });
  }

  toResourceFromEntity(entity: ServiceEntity): ServiceResource {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      basePrice: entity.basePrice,
      category: entity.category,
      imageUrl: entity.imageUrl
    };
  }

  toEntitiesFromResponse(response: ServicesResponse): ServiceEntity[] {
    return response.services.map(resource => this.toEntityFromResource(resource));
  }
}
