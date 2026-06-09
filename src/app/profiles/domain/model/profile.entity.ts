import { BaseEntity } from '@shared/infrastructure/base-entity';

/**
 * Represents the role of a profile in the Electrolink platform.
 */
export type ProfileRole = 'HOMEOWNER' | 'TECHNICIAN';

/**
 * Domain entity representing a user profile (Aggregate Root).
 * Combines personal, professional, and location data into a single flat model.
 * Conditional fields depend on the profile's role.
 */
export class Profile implements BaseEntity {
  private _id: number;
  private _firstName: string;
  private _lastName: string;
  private _email: string;
  private _street: string;
  private _role: ProfileRole;
  private _dni: string;
  private _phoneNumber: string;

  // Technician-specific fields
  private _specialties: string;
  private _yearsOfExperience: number;
  private _certificationCode: string;

  // HomeOwner-specific fields
  private _additionalInfo: string;

  // Location and coverage fields
  private _latitude?: number;
  private _longitude?: number;
  private _coverageRadius?: number;

  constructor(data: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    street: string;
    role: ProfileRole;
    dni?: string;
    phoneNumber?: string;
    specialties?: string;
    yearsOfExperience?: number;
    certificationCode?: string;
    additionalInfo?: string;
    latitude?: number;
    longitude?: number;
    coverageRadius?: number;
  }) {
    this._id = data.id;
    this._firstName = data.firstName;
    this._lastName = data.lastName;
    this._email = data.email;
    this._street = data.street;
    this._role = data.role;
    this._dni = data.dni || '';
    this._phoneNumber = data.phoneNumber || '';
    this._specialties = data.specialties || '';
    this._yearsOfExperience = data.yearsOfExperience || 0;
    this._certificationCode = data.certificationCode || '';
    this._additionalInfo = data.additionalInfo || '';
    this._latitude = data.latitude;
    this._longitude = data.longitude;
    this._coverageRadius = data.coverageRadius;
  }

  // --- Getters ---

  get id(): number {
    return this._id;
  }

  get firstName(): string {
    return this._firstName;
  }

  get lastName(): string {
    return this._lastName;
  }

  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }

  get email(): string {
    return this._email;
  }

  get street(): string {
    return this._street;
  }

  get role(): ProfileRole {
    return this._role;
  }

  get dni(): string {
    return this._dni;
  }

  get phoneNumber(): string {
    return this._phoneNumber;
  }

  get specialties(): string {
    return this._specialties;
  }

  get yearsOfExperience(): number {
    return this._yearsOfExperience;
  }

  get certificationCode(): string {
    return this._certificationCode;
  }

  get additionalInfo(): string {
    return this._additionalInfo;
  }

  get latitude(): number | undefined {
    return this._latitude;
  }

  get longitude(): number | undefined {
    return this._longitude;
  }

  get coverageRadius(): number | undefined {
    return this._coverageRadius;
  }

  // --- Domain logic ---

  get isHomeOwner(): boolean {
    return this._role === 'HOMEOWNER';
  }

  get isTechnician(): boolean {
    return this._role === 'TECHNICIAN';
  }

  /**
   * Returns the role-specific detail field value.
   * For technicians: certification code. For homeowners: additional info.
   */
  get roleSpecificDetail(): string {
    return this.isTechnician ? this._certificationCode : this._additionalInfo;
  }
}
