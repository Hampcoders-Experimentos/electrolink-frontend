import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '@shared/infrastructure/base-api-endpoint';
import { ServiceOperation } from '../domain/model/service-operation.entity';
import { ServiceOperationResource, ServiceOperationsResponse, CreateServiceOperationResource, UpdateServiceStatusResource } from './service-operation-response';
import { ServiceOperationAssembler } from './service-operation-assembler';
import { environment } from '@env/environment';
import { catchError, map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ServiceOperationEndpoint extends BaseApiEndpoint<ServiceOperation, ServiceOperationResource, ServiceOperationsResponse, ServiceOperationAssembler> {

  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/api/v1/service-operations`, new ServiceOperationAssembler());
  }

  createFromResource(resource: CreateServiceOperationResource): Observable<ServiceOperation> {
    return this.http.post<ServiceOperationResource>(this.endpointUrl, resource).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create service operation'))
    );
  }

  updateStatus(resource: UpdateServiceStatusResource): Observable<ServiceOperation> {
    return this.http.put<ServiceOperationResource>(`${this.endpointUrl}/status`, resource).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError(`Failed to update service operation status for id=${resource.serviceOperationId}`))
    );
  }

  getByTechnicianId(technicianId: string | number): Observable<ServiceOperation[]> {
    return this.http.get<ServiceOperationResource[]>(`${this.endpointUrl}/technicians/${technicianId}`).pipe(
      map(resources => resources.map(r => this.assembler.toEntityFromResource(r))),
      catchError(this.handleError(`Failed to fetch service operations for technicianId=${technicianId}`))
    );
  }

  getByRequestId(requestId: string | number): Observable<ServiceOperation> {
    return this.http.get<ServiceOperationResource[]>(`${this.endpointUrl}?requestId=${requestId}`).pipe(
      map(resources => {
        if (!resources || resources.length === 0) {
          throw new Error(`Service operation not found for requestId=${requestId}`);
        }
        return this.assembler.toEntityFromResource(resources[0]);
      }),
      catchError(this.handleError(`Failed to fetch service operation for requestId=${requestId}`))
    );
  }
}
