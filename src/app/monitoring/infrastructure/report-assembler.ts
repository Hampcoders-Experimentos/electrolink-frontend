import { BaseAssembler } from '@shared/infrastructure/base-assembler';
import { Report } from '../domain/model/report.entity';
import { ReportPhoto } from '../domain/model/report-photo.entity';
import { ReportResource, ReportsResponse, ReportPhotoResource } from './report-response';

export class ReportAssembler extends BaseAssembler<Report, ReportResource, ReportsResponse> {

  toEntityFromResource(resource: ReportResource): Report {
    return new Report({
      id: resource.id,
      serviceOperationId: resource.serviceOperationId,
      reportType: resource.reportType,
      description: resource.description,
      createdAt: resource.createdAt ? new Date(resource.createdAt) : undefined
    });
  }

  toResourceFromEntity(entity: Report): ReportResource {
    return {
      id: entity.id,
      serviceOperationId: entity.serviceOperationId,
      reportType: entity.reportType,
      description: entity.description,
      createdAt: entity.createdAt.toISOString()
    };
  }

  toEntitiesFromResponse(response: ReportsResponse): Report[] {
    if (!response || !response.reports) {
      return [];
    }
    return response.reports.map(resource => this.toEntityFromResource(resource));
  }

  toPhotoEntityFromResource(resource: ReportPhotoResource): ReportPhoto {
    return new ReportPhoto({
      id: resource.id,
      reportId: resource.reportId,
      url: resource.url,
      fileName: resource.fileName,
      contentType: resource.contentType
    });
  }

  toPhotoResourceFromEntity(entity: ReportPhoto): ReportPhotoResource {
    return {
      id: entity.id,
      reportId: entity.reportId,
      url: entity.url,
      fileName: entity.fileName,
      contentType: entity.contentType
    };
  }
}
