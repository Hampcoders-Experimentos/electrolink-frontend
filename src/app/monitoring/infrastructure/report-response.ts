import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { ReportType } from '../domain/model/report.entity';

export interface ReportPhotoResource extends BaseResource {
  id: string;
  reportId: string;
  url: string;
  fileName: string;
  contentType: string;
}

export interface ReportResource extends BaseResource {
  id: string;
  serviceOperationId: string;
  reportType: ReportType;
  description: string;
  createdAt: string;
  photos?: ReportPhotoResource[];
}

export interface CreateReportResource {
  serviceOperationId: string;
  reportType: ReportType;
  description: string;
}

export interface CreateReportPhotoResource {
  reportId: string;
  url: string;
  fileName: string;
  contentType: string;
}

export interface ReportsResponse extends BaseResponse {
  reports: ReportResource[];
}

export interface ReportPhotosResponse extends BaseResponse {
  reportPhotos: ReportPhotoResource[];
}
