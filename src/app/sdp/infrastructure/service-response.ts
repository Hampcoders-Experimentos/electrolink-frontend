import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

export interface ServiceResource extends BaseResource {
  id: string | number;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  imageUrl?: string;
}

export interface ServicesResponse extends BaseResponse {
  services: ServiceResource[];
}
