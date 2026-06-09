import { BaseResource, BaseResponse } from '@shared/infrastructure/base-response';

export interface RequestResource extends BaseResource {
  id: string | number;
  homeownerId: number;
  propertyId: string | number;
  serviceId: string | number;
  description: string;
  requiresBill: boolean;
  priority: string;
  status: string;
  assignedTechnicianId?: number;
}

export interface CreateRequestResource {
  homeownerId: number;
  propertyId: string | number;
  serviceId: string | number;
  description: string;
  requiresBill: boolean;
  priority: string;
  status: string;
}

export interface RequestsResponse extends BaseResponse {
  requests: RequestResource[];
}
