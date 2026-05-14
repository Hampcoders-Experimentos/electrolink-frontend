import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { RequestEntity } from '../domain/model/request.entity';
import { CreateRequestResource, RequestResource, RequestsResponse } from './request-response';
import { RequestAssembler } from './request-assembler';
import { environment } from '../../../environments/environment';
import { catchError, map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RequestApiEndpoint extends BaseApiEndpoint<RequestEntity, RequestResource, RequestsResponse, RequestAssembler> {

  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/api/v1/requests`, new RequestAssembler());
  }

  createFromResource(resource: CreateRequestResource): Observable<RequestEntity> {
    return this.http.post<RequestResource>(this.endpointUrl, resource).pipe(
      map(created => this.assembler.toEntityFromResource(created)),
      catchError(this.handleError('Failed to create request'))
    );
  }

  getByHomeownerId(homeownerId: number): Observable<RequestEntity[]> {
    return this.http.get<RequestResource[]>(`${this.endpointUrl}?homeownerId=${homeownerId}`).pipe(
      map(resources => resources.map(r => this.assembler.toEntityFromResource(r))),
      catchError(this.handleError(`Failed to fetch requests for homeownerId=${homeownerId}`))
    );
  }

  updateFromResource(resource: RequestResource, id: string | number): Observable<RequestEntity> {
    return this.http.put<RequestResource>(`${this.endpointUrl}/${id}`, resource).pipe(
      map(updated => this.assembler.toEntityFromResource(updated)),
      catchError(this.handleError(`Failed to update request with id=${id}`))
    );
  }
}
