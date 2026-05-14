import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export type ReportType = 'INCIDENT' | 'MAINTENANCE' | 'OTHER';

export class Report implements BaseEntity {
  private _id: string;
  private _serviceOperationId: string;
  private _reportType: ReportType;
  private _description: string;
  private _createdAt: Date;

  constructor(data: {
    id: string;
    serviceOperationId: string;
    reportType: ReportType;
    description: string;
    createdAt?: Date;
  }) {
    this._id = data.id;
    this._serviceOperationId = data.serviceOperationId;
    this._reportType = data.reportType;
    this._description = data.description;
    this._createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  }

  get id(): string {
    return this._id;
  }

  get serviceOperationId(): string {
    return this._serviceOperationId;
  }

  get reportType(): ReportType {
    return this._reportType;
  }

  get description(): string {
    return this._description;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
