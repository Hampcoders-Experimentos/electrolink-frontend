import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { ServiceOperationStatus } from '../domain/model/service-operation.entity';

export interface ServiceOperationResource extends BaseResource {
  id: string;
  requestId: string;
  technicianId: string;
  status: ServiceOperationStatus;
  startedAt: string;
  completedAt?: string;
}

export interface CreateServiceOperationResource {
  requestId: string;
  technicianId: string;
  startedAt: string;
  status?: ServiceOperationStatus;
}

export interface UpdateServiceStatusResource {
  serviceOperationId: string;
  status: ServiceOperationStatus;
}

export interface ServiceOperationsResponse extends BaseResponse {
  serviceOperations: ServiceOperationResource[];
}
