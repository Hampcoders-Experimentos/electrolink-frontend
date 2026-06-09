import { BaseResource, BaseResponse } from '@shared/infrastructure/base-response';

export interface RatingResource extends BaseResource {
  id: string;
  requestId: string;
  technicianId: string;
  raterId: string;
  score: number;
  comment: string;
  createdAt: string;
}

export interface CreateRatingResource {
  requestId: string;
  technicianId: string;
  raterId: string;
  score: number;
  comment?: string;
}

export interface RatingsResponse extends BaseResponse {
  ratings: RatingResource[];
}
