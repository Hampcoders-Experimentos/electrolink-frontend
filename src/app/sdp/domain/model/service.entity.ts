import { BaseEntity } from '../../../shared/infrastructure/base-entity';

/**
 * Domain entity representing a Service available in the catalog.
 */
export class ServiceEntity implements BaseEntity {
  private _id: string | number;
  private _name: string;
  private _description: string;
  private _basePrice: number;
  private _category: string;
  private _imageUrl: string;

  constructor(data: {
    id: string | number;
    name: string;
    description: string;
    basePrice: number;
    category: string;
    imageUrl?: string;
  }) {
    this._id = data.id;
    this._name = data.name;
    this._description = data.description;
    this._basePrice = data.basePrice;
    this._category = data.category;
    this._imageUrl = data.imageUrl || '';
  }

  get id(): string | number { return this._id; }
  get name(): string { return this._name; }
  get description(): string { return this._description; }
  get basePrice(): number { return this._basePrice; }
  get category(): string { return this._category; }
  get imageUrl(): string { return this._imageUrl; }
}
