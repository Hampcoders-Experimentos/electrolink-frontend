import { computed, Injectable, signal } from '@angular/core';
import { User } from '../domain/model/user.entity';
import { IamApiService } from '../infrastructure/iam-api.service';
import { Observable, tap } from 'rxjs';
import { SignInResource, SignUpResource } from '../infrastructure/user.response';
import { UserAssembler } from '../infrastructure/user.assembler';

@Injectable({ providedIn: 'root' })
export class IamStore {
  private readonly currentUserSignal = signal<User | null>(this.loadUserFromStorage());
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);
  private readonly usersListSignal = signal<User[]>([]);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly loading = this.loadingSignal.asReadonly();
  readonly errorMessage = this.errorSignal.asReadonly();
  readonly users = this.usersListSignal.asReadonly();

  private assembler = new UserAssembler();

  constructor(private iamApiService: IamApiService) {}

  private loadUserFromStorage(): User | null {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const parsed = JSON.parse(stored);
        return new User(parsed);
      }
    } catch (e) {
      console.error('Error loading user from storage', e);
    }
    return null;
  }

  private saveUserToStorage(user: User | null): void {
    try {
      if (user) {
        localStorage.setItem(
          'currentUser',
          JSON.stringify({
            id: user.id,
            username: user.username,
            email: user.email,
            roles: user.roles,
            subscriptionState: user.subscriptionState,
            token: user.token
          })
        );
      } else {
        localStorage.removeItem('currentUser');
      }
    } catch (e) {
      console.error('Error saving user to storage', e);
    }
  }

  signUp(signUpData: SignUpResource): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.iamApiService.signUp(signUpData).pipe(
      tap({
        next: authResource => {
          const user = this.assembler.toEntityFromAuthenticatedResource(authResource);
          this.currentUserSignal.set(user);
          this.saveUserToStorage(user);
          this.loadingSignal.set(false);
        },
        error: err => {
          this.errorSignal.set('Error al registrar cuenta. Inténtelo de nuevo.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  signIn(signInData: SignInResource): Observable<any> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.iamApiService.signIn(signInData).pipe(
      tap({
        next: authResource => {
          const user = this.assembler.toEntityFromAuthenticatedResource(authResource);
          this.currentUserSignal.set(user);
          this.saveUserToStorage(user);
          this.loadingSignal.set(false);
        },
        error: err => {
          this.errorSignal.set('Credenciales inválidas. Verifique su usuario y contraseña.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  logout(): void {
    this.currentUserSignal.set(null);
    this.saveUserToStorage(null);
  }

  loadUsers(): Observable<User[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.iamApiService.getUsers().pipe(
      tap({
        next: users => {
          this.usersListSignal.set(users);
          this.loadingSignal.set(false);
        },
        error: err => {
          this.errorSignal.set('Error al cargar la lista de usuarios');
          this.loadingSignal.set(false);
        }
      })
    );
  }
}
