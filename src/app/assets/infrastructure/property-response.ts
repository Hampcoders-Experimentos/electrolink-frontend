import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Resource interface for property data returned by the API.
 */
export interface PropertyResource extends BaseResource {
  id: string | number;
  ownerId: number;
  address: string;
  region: string;
  district: string;
  photos?: string[];
}

/**
 * Resource interface for creating a new property.
 */
export interface CreatePropertyResource {
  ownerId: number;
  address: string;
  region: string;
  district: string;
  photos?: string[];
}

/**
 * Response interface wrapping an array of property resources.
 */
export interface PropertiesResponse extends BaseResponse {
  properties: PropertyResource[];
}
