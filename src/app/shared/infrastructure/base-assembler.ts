import { BaseEntity } from './base-entity';
import { BaseResource, BaseResponse } from './base-response';

/**
 * BaseAssembler abstract class for converting between entities, resources, and responses.
 * @template TEntity - The type of the entity.
 * @template TResource - The type of the resource.
 * @template TResponse - The type of the response.
 */
export abstract class BaseAssembler<
  TEntity extends BaseEntity,
  TResource extends BaseResource,
  TResponse extends BaseResponse
> {
  abstract toEntityFromResource(resource: TResource): TEntity;
  abstract toResourceFromEntity(entity: TEntity): TResource;
  abstract toEntitiesFromResponse(response: TResponse): TEntity[];
}
