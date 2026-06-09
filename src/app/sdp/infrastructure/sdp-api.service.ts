import { Injectable } from '@angular/core';
import { BaseApi } from '@shared/infrastructure/base-api';
import { ServiceApiEndpoint } from './service-api-endpoint';
import { RequestApiEndpoint } from './request-api-endpoint';
import { ScheduleApiEndpoint } from './schedule-api-endpoint';
import { ServiceEntity } from '../domain/model/service.entity';
import { RequestEntity } from '../domain/model/request.entity';
import { ScheduleAggregate } from '../domain/model/schedule.entity';
import { Observable } from 'rxjs';
import { CreateRequestResource, RequestResource } from './request-response';
import { CreateScheduleResource, ScheduleResource } from './schedule-response';

@Injectable({ providedIn: 'root' })
export class SdpApiService extends BaseApi {

  constructor(
    public serviceEndpoint: ServiceApiEndpoint,
    public requestEndpoint: RequestApiEndpoint,
    public scheduleEndpoint: ScheduleApiEndpoint
  ) {
    super();
  }

  // --- Service API ---
  getServices(): Observable<ServiceEntity[]> {
    return this.serviceEndpoint.getAll();
  }

  getServiceById(id: string | number): Observable<ServiceEntity> {
    return this.serviceEndpoint.getById(id);
  }

  createService(entity: ServiceEntity): Observable<ServiceEntity> {
    return this.serviceEndpoint.create(entity);
  }

  // --- Request API ---
  getRequestsByHomeownerId(homeownerId: number): Observable<RequestEntity[]> {
    return this.requestEndpoint.getByHomeownerId(homeownerId);
  }

  createRequest(resource: CreateRequestResource): Observable<RequestEntity> {
    return this.requestEndpoint.createFromResource(resource);
  }

  updateRequest(resource: RequestResource, id: string | number): Observable<RequestEntity> {
    return this.requestEndpoint.updateFromResource(resource, id);
  }

  // --- Schedule API ---
  getSchedulesByTechnicianId(technicianId: number): Observable<ScheduleAggregate[]> {
    return this.scheduleEndpoint.getByTechnicianId(technicianId);
  }

  createSchedule(resource: CreateScheduleResource): Observable<ScheduleAggregate> {
    return this.scheduleEndpoint.createFromResource(resource);
  }

  updateSchedule(resource: ScheduleResource, id: string | number): Observable<ScheduleAggregate> {
    return this.scheduleEndpoint.updateFromResource(resource, id);
  }
}
