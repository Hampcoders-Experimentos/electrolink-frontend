import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { Rating } from '../domain/model/rating.entity';
import { RatingResource, RatingsResponse } from './rating-response';

export class RatingAssembler extends BaseAssembler<Rating, RatingResource, RatingsResponse> {
  
  toEntityFromResource(resource: RatingResource): Rating {
    return new Rating({
      id: resource.id,
      requestId: resource.requestId,
      technicianId: resource.technicianId,
      raterId: resource.raterId,
      score: resource.score,
      comment: resource.comment,
      createdAt: resource.createdAt ? new Date(resource.createdAt) : undefined
    });
  }

  toResourceFromEntity(entity: Rating): RatingResource {
    return {
      id: entity.id,
      requestId: entity.requestId,
      technicianId: entity.technicianId,
      raterId: entity.raterId,
      score: entity.score,
      comment: entity.comment,
      createdAt: entity.createdAt.toISOString()
    };
  }

  toEntitiesFromResponse(response: RatingsResponse): Rating[] {
    if (!response || !response.ratings) {
      return [];
    }
    return response.ratings.map(resource => this.toEntityFromResource(resource));
  }
}
