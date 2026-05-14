import { Injectable } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { UsersApiEndpoint } from './users-api-endpoint';
import { User } from '../domain/model/user.entity';
import { Observable } from 'rxjs';
import { AuthenticatedUserResource, SignInResource, SignUpResource } from './user.response';

@Injectable({ providedIn: 'root' })
export class IamApiService extends BaseApi {
  constructor(public usersEndpoint: UsersApiEndpoint) {
    super();
  }

  signUp(signUpData: SignUpResource): Observable<AuthenticatedUserResource> {
    return this.usersEndpoint.signUp(signUpData);
  }

  signIn(signInData: SignInResource): Observable<AuthenticatedUserResource> {
    return this.usersEndpoint.signIn(signInData);
  }

  getUsers(): Observable<User[]> {
    return this.usersEndpoint.getAll();
  }

  getUserById(id: string | number): Observable<User> {
    return this.usersEndpoint.getById(id);
  }

  createUser(user: User): Observable<User> {
    return this.usersEndpoint.create(user);
  }

  updateUser(user: User, id: string | number): Observable<User> {
    return this.usersEndpoint.update(user, id);
  }

  deleteUser(id: string | number): Observable<void> {
    return this.usersEndpoint.delete(id);
  }
}
