import { Injectable } from '@angular/core';
import { BaseApi } from '@shared/infrastructure/base-api';
import { ServiceOperationEndpoint } from './service-operation-endpoint';
import { ReportEndpoint } from './report-endpoint';
import { RatingEndpoint } from './rating-endpoint';
import { ServiceOperation } from '../domain/model/service-operation.entity';
import { Report } from '../domain/model/report.entity';
import { Rating } from '../domain/model/rating.entity';
import { Observable } from 'rxjs';
import { CreateServiceOperationResource, UpdateServiceStatusResource } from './service-operation-response';
import { CreateReportResource, CreateReportPhotoResource, ReportPhotoResource } from './report-response';
import { CreateRatingResource, RatingResource } from './rating-response';

@Injectable({ providedIn: 'root' })
export class MonitoringApiService extends BaseApi {

  constructor(
    public serviceOperationEndpoint: ServiceOperationEndpoint,
    public reportEndpoint: ReportEndpoint,
    public ratingEndpoint: RatingEndpoint
  ) {
    super();
  }

  // --- Service Operation API ---

  getServiceOperations(): Observable<ServiceOperation[]> {
    return this.serviceOperationEndpoint.getAll();
  }

  getServiceOperationById(id: string | number): Observable<ServiceOperation> {
    return this.serviceOperationEndpoint.getById(id);
  }

  getServiceOperationsByTechnicianId(technicianId: string | number): Observable<ServiceOperation[]> {
    return this.serviceOperationEndpoint.getByTechnicianId(technicianId);
  }

  getServiceOperationByRequestId(requestId: string | number): Observable<ServiceOperation> {
    return this.serviceOperationEndpoint.getByRequestId(requestId);
  }

  createServiceOperation(resource: CreateServiceOperationResource): Observable<ServiceOperation> {
    return this.serviceOperationEndpoint.createFromResource(resource);
  }

  updateServiceStatus(resource: UpdateServiceStatusResource): Observable<ServiceOperation> {
    return this.serviceOperationEndpoint.updateStatus(resource);
  }

  // --- Report API ---

  getReports(): Observable<Report[]> {
    return this.reportEndpoint.getAll();
  }

  getReportById(id: string | number): Observable<Report> {
    return this.reportEndpoint.getById(id);
  }

  getReportsByServiceOperationId(serviceOperationId: string | number): Observable<Report[]> {
    return this.reportEndpoint.getByServiceOperationId(serviceOperationId);
  }

  createReport(resource: CreateReportResource): Observable<Report> {
    return this.reportEndpoint.createFromResource(resource);
  }

  deleteReport(id: string | number): Observable<void> {
    return this.reportEndpoint.delete(id);
  }

  addReportPhoto(resource: CreateReportPhotoResource): Observable<ReportPhotoResource> {
    return this.reportEndpoint.addPhoto(resource);
  }

  getReportPhotos(reportId: string | number): Observable<ReportPhotoResource[]> {
    return this.reportEndpoint.getPhotosByReportId(reportId);
  }

  // --- Rating API ---

  getRatings(): Observable<Rating[]> {
    return this.ratingEndpoint.getAll();
  }

  getRatingById(id: string | number): Observable<Rating> {
    return this.ratingEndpoint.getById(id);
  }

  getRatingsByTechnicianId(technicianId: string | number): Observable<Rating[]> {
    return this.ratingEndpoint.getByTechnicianId(technicianId);
  }

  getRatingsByRequestId(requestId: string | number): Observable<Rating[]> {
    return this.ratingEndpoint.getByRequestId(requestId);
  }

  createRating(resource: CreateRatingResource): Observable<Rating> {
    return this.ratingEndpoint.createFromResource(resource);
  }

  updateRating(resource: RatingResource, id: string | number): Observable<Rating> {
    return this.ratingEndpoint.updateFromResource(resource, id);
  }

  deleteRating(id: string | number): Observable<void> {
    return this.ratingEndpoint.delete(id);
  }
}
