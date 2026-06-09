import { BaseEntity } from '@shared/infrastructure/base-entity';

/**
 * Domain entity representing a Technician Schedule slot.
 */
export class ScheduleAggregate implements BaseEntity {
  private _id: string | number;
  private _technicianId: number;
  private _date: string;
  private _startTime: string;
  private _endTime: string;
  private _isAvailable: boolean;

  constructor(data: {
    id: string | number;
    technicianId: number;
    date: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }) {
    this._id = data.id;
    this._technicianId = data.technicianId;
    this._date = data.date;
    this._startTime = data.startTime;
    this._endTime = data.endTime;
    this._isAvailable = data.isAvailable;
  }

  get id(): string | number { return this._id; }
  get technicianId(): number { return this._technicianId; }
  get date(): string { return this._date; }
  get startTime(): string { return this._startTime; }
  get endTime(): string { return this._endTime; }
  get isAvailable(): boolean { return this._isAvailable; }
}
