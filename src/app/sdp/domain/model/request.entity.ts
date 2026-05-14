import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export type RequestStatus = 'PENDING' | 'MATCHED' | 'IN_PROGRESS' | 'COMPLETED';
export type RequestPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY';

/**
 * Domain entity representing a Service Request.
 */
export class RequestEntity implements BaseEntity {
  private _id: string | number;
  private _homeownerId: number;
  private _propertyId: string | number;
  private _serviceId: string | number;
  private _description: string;
  private _requiresBill: boolean;
  private _priority: RequestPriority;
  private _status: RequestStatus;
  private _assignedTechnicianId?: number;

  constructor(data: {
    id: string | number;
    homeownerId: number;
    propertyId: string | number;
    serviceId: string | number;
    description: string;
    requiresBill: boolean;
    priority: RequestPriority;
    status: RequestStatus;
    assignedTechnicianId?: number;
  }) {
    this._id = data.id;
    this._homeownerId = data.homeownerId;
    this._propertyId = data.propertyId;
    this._serviceId = data.serviceId;
    this._description = data.description;
    this._requiresBill = data.requiresBill;
    this._priority = data.priority;
    this._status = data.status;
    this._assignedTechnicianId = data.assignedTechnicianId;
  }

  get id(): string | number { return this._id; }
  get homeownerId(): number { return this._homeownerId; }
  get propertyId(): string | number { return this._propertyId; }
  get serviceId(): string | number { return this._serviceId; }
  get description(): string { return this._description; }
  get requiresBill(): boolean { return this._requiresBill; }
  get priority(): RequestPriority { return this._priority; }
  get status(): RequestStatus { return this._status; }
  get assignedTechnicianId(): number | undefined { return this._assignedTechnicianId; }
}
