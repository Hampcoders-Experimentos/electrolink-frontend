import { BaseEntity } from '@shared/infrastructure/base-entity';

export class Rating implements BaseEntity {
  private _id: string;
  private _requestId: string;
  private _technicianId: string;
  private _raterId: string;
  private _score: number;
  private _comment: string;
  private _createdAt: Date;

  constructor(data: {
    id: string;
    requestId: string;
    technicianId: string;
    raterId: string;
    score: number;
    comment?: string;
    createdAt?: Date;
  }) {
    this._id = data.id;
    this._requestId = data.requestId;
    this._technicianId = data.technicianId;
    this._raterId = data.raterId;
    this._score = Math.min(5, Math.max(1, data.score));
    this._comment = data.comment || '';
    this._createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
  }

  get id(): string {
    return this._id;
  }

  get requestId(): string {
    return this._requestId;
  }

  get technicianId(): string {
    return this._technicianId;
  }

  get raterId(): string {
    return this._raterId;
  }

  get score(): number {
    return this._score;
  }

  get comment(): string {
    return this._comment;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
