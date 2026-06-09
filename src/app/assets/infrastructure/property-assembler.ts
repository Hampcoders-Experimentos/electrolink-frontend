import { BaseAssembler } from '@shared/infrastructure/base-assembler';
import { Property } from '../domain/model/property.entity';
import { PropertyResource, PropertiesResponse } from './property-response';

/**
 * Assembler for converting between Property entities and API resources.
 */
export class PropertyAssembler extends BaseAssembler<Property, PropertyResource, PropertiesResponse> {

  toEntityFromResource(resource: PropertyResource): Property {
    return new Property({
      id: resource.id,
      ownerId: resource.ownerId,
      address: resource.address,
      region: resource.region,
      district: resource.district,
      photos: resource.photos
    });
  }

  toResourceFromEntity(entity: Property): PropertyResource {
    return {
      id: entity.id,
      ownerId: entity.ownerId,
      address: entity.address,
      region: entity.region,
      district: entity.district,
      photos: entity.photos
    };
  }

  toEntitiesFromResponse(response: PropertiesResponse): Property[] {
    return response.properties.map(resource => this.toEntityFromResource(resource));
  }
}
