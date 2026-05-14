import { BaseEntity } from '../../../shared/infrastructure/base-entity';

/**
 * Domain entity representing a Property (Aggregate Root in Assets BC).
 */
export class Property implements BaseEntity {
  private _id: string | number;
  private _ownerId: number;
  private _address: string;
  private _region: string;
  private _district: string;
  private _photos: string[];

  constructor(data: {
    id: string | number;
    ownerId: number;
    address: string;
    region: string;
    district: string;
    photos?: string[];
  }) {
    this._id = data.id;
    this._ownerId = data.ownerId;
    this._address = data.address;
    this._region = data.region;
    this._district = data.district;
    this._photos = data.photos || [];
  }

  // --- Getters ---

  get id(): string | number {
    return this._id;
  }

  get ownerId(): number {
    return this._ownerId;
  }

  get address(): string {
    return this._address;
  }

  get region(): string {
    return this._region;
  }

  get district(): string {
    return this._district;
  }

  get photos(): string[] {
    return this._photos;
  }

  get fullLocation(): string {
    return `${this._district}, ${this._region}`;
  }
}
