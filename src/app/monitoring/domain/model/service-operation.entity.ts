import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export type ServiceOperationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export class ServiceOperation implements BaseEntity {
  private _id: string;
  private _requestId: string;
  private _technicianId: string;
  private _status: ServiceOperationStatus;
  private _startedAt: Date;
  private _completedAt?: Date;

  constructor(data: {
    id: string;
    requestId: string;
    technicianId: string;
    status?: ServiceOperationStatus;
    startedAt?: Date;
    completedAt?: Date;
  }) {
    this._id = data.id;
    this._requestId = data.requestId;
    this._technicianId = data.technicianId;
    this._status = data.status || 'PENDING';
    this._startedAt = data.startedAt ? new Date(data.startedAt) : new Date();
    if (data.completedAt) {
      this._completedAt = new Date(data.completedAt);
    }
  }

  // --- Getters ---

  get id(): string {
    return this._id;
  }

  get requestId(): string {
    return this._requestId;
  }

  get technicianId(): string {
    return this._technicianId;
  }

  get status(): ServiceOperationStatus {
    return this._status;
  }

  get startedAt(): Date {
    return this._startedAt;
  }

  get completedAt(): Date | undefined {
    return this._completedAt;
  }

  // --- Domain Methods ---

  start(): void {
    if (this._status !== 'PENDING') {
      throw new Error(`Cannot start service operation from status ${this._status}.`);
    }
    this._status = 'IN_PROGRESS';
    this._startedAt = new Date();
  }

  complete(): void {
    if (this._status !== 'IN_PROGRESS') {
      throw new Error(`Cannot complete service operation from status ${this._status}.`);
    }
    this._status = 'COMPLETED';
    this._completedAt = new Date();
  }

  cancel(): void {
    if (this._status === 'COMPLETED') {
      throw new Error('Cannot cancel an already completed service operation.');
    }
    this._status = 'CANCELLED';
  }
}
