import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { ServiceEntity } from '../domain/model/service.entity';
import { ServiceResource, ServicesResponse } from './service-response';
import { ServiceAssembler } from './service-assembler';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ServiceApiEndpoint extends BaseApiEndpoint<ServiceEntity, ServiceResource, ServicesResponse, ServiceAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/api/v1/services`, new ServiceAssembler());
  }
}
