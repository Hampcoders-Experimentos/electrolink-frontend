import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseApiEndpoint } from '../../shared/infrastructure/base-api-endpoint';
import { User } from '../domain/model/user.entity';
import { AuthenticatedUserResource, SignInResource, SignUpResource, UserResource, UsersResponse } from './user.response';
import { UserAssembler } from './user.assembler';
import { environment } from '../../../environments/environment';
import { catchError, map, Observable, of, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsersApiEndpoint extends BaseApiEndpoint<User, UserResource, UsersResponse, UserAssembler> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiBaseUrl}/users`, new UserAssembler());
  }

  signUp(signUpData: SignUpResource): Observable<AuthenticatedUserResource> {
    return this.http.post<AuthenticatedUserResource>(`${environment.apiBaseUrl}/authentication/sign-up`, signUpData).pipe(
      catchError(err => {
        // Fallback for json-server simulation
        const newUser: UserResource = {
          id: Date.now().toString(),
          username: signUpData.username,
          email: signUpData.username,
          roles: signUpData.roles,
          subscriptionState: 'FREE'
        };
        return this.http.post<UserResource>(this.endpointUrl, newUser).pipe(
          map(created => ({
            id: created.id,
            username: created.username,
            token: 'fake-jwt-token-' + created.id,
            roles: created.roles
          }))
        );
      })
    );
  }

  signIn(signInData: SignInResource): Observable<AuthenticatedUserResource> {
    return this.http.post<AuthenticatedUserResource>(`${environment.apiBaseUrl}/authentication/sign-in`, signInData).pipe(
      catchError(err => {
        // Fallback for json-server simulation
        return this.http.get<UserResource[]>(this.endpointUrl).pipe(
          map(users => {
            const found = users.find(u => u.username === signInData.username || u.email === signInData.username);
            if (found) {
              return {
                id: found.id,
                username: found.username,
                token: 'fake-jwt-token-' + found.id,
                roles: found.roles
              };
            }
            throw new Error('Credenciales inválidas');
          })
        );
      })
    );
  }
}
