import { BaseEntity } from '@shared/infrastructure/base-entity';

export class User implements BaseEntity {
  private _id: string | number;
  private _username: string;
  private _email: string;
  private _roles: string[];
  private _subscriptionState: string;
  private _password?: string;
  private _token?: string;

  constructor(user: {
    id: string | number;
    username: string;
    email?: string;
    roles: string[];
    subscriptionState?: string;
    password?: string;
    token?: string;
  }) {
    this._id = user.id;
    this._username = user.username;
    this._email = user.email || user.username;
    this._roles = user.roles;
    this._subscriptionState = user.subscriptionState || 'FREE';
    this._password = user.password;
    this._token = user.token;
  }

  get id(): string | number {
    return this._id;
  }

  get username(): string {
    return this._username;
  }

  get email(): string {
    return this._email;
  }

  get roles(): string[] {
    return this._roles;
  }

  get subscriptionState(): string {
    return this._subscriptionState;
  }

  get password(): string | undefined {
    return this._password;
  }

  get token(): string | undefined {
    return this._token;
  }

  hasRole(role: string): boolean {
    return this._roles.includes(role);
  }
}
