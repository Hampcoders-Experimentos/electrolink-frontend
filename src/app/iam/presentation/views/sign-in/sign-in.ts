import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IamStore } from '@iam/application/iam-store.service';
import { AuthStore } from '@shared/infrastructure/stores/auth.store';
import { IconComponent } from '@shared/presentation/components/icon/icon';

/**
 * Role choices presented in the sign-in segmented control.
 *
 * The literal-string union mirrors the back-end role names returned by IAM
 * and keeps both the role tab and post-login routing logic type-safe.
 */
export type SignInRole = 'Technician' | 'Homeowner';

/**
 * Sign-in view for the Electrolink portal.
 *
 * Visual specification: Figma frame `4:5` (Electrolink-EXP).
 * Split layout — hero on the left, form on the right. Fully zoneless-friendly:
 * all reactive state is exposed as Signals so the template only triggers
 * change detection when a signal it depends on actually changes.
 *
 * ### State signals
 * - {@link selectedRole} — currently selected role tab.
 * - {@link showPassword} — toggles visibility of the password field.
 *
 * ### External store dependencies
 * - {@link IamStore} — sign-in side effects (`signIn`, `loading`,
 *   `errorMessage`, `currentUser`, `isAuthenticated`).
 * - {@link AuthStore} — receives the resolved session for guards/menus.
 *
 * ### Lifecycle
 * - `ngOnInit` builds the reactive form once.
 */
@Component({
  selector: 'app-sign-in',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IconComponent, NgOptimizedImage],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignInComponent implements OnInit {
  /** Application store mediating sign-in requests and IAM session state. */
  readonly store = inject(IamStore);

  /** Cross-cutting auth store; mirrors the resolved session for guards & menus. */
  private readonly authStore = inject(AuthStore);

  /** Angular router used to navigate after a successful login. */
  private readonly router = inject(Router);

  /** FormBuilder used to construct the reactive form during {@link ngOnInit}. */
  private readonly fb = inject(FormBuilder);

  /** Role tab currently active in the segmented control. */
  readonly selectedRole: WritableSignal<SignInRole> = signal<SignInRole>('Technician');

  /** Whether the password input is rendered as plain text. */
  readonly showPassword: WritableSignal<boolean> = signal<boolean>(false);

  /**
   * Reactive form backing the login fields.
   *
   * Built inside {@link ngOnInit} so the FormBuilder is resolved through DI
   * before use. Shape: `{ username: string, password: string, rememberMe: boolean }`.
   */
  loginForm!: FormGroup;

  /** Builds the reactive form schema. Runs once per component instance. */
  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: [''],
      rememberMe: [false],
    });
  }

  /**
   * Submits credentials to {@link IamStore.signIn} and routes the user to the
   * dashboard that matches their role. No-op when the form is invalid.
   */
  onSubmit(): void {
    if (!this.loginForm.valid) {
      return;
    }
    this.store.signIn(this.loginForm.value).subscribe({
      next: () => {
        if (!this.store.isAuthenticated()) {
          return;
        }
        const user = this.store.currentUser()!;
        const role = user.roles?.[0];
        const roleKey: 'owner' | 'technician' = role === 'Technician' ? 'technician' : 'owner';

        this.authStore.login({
          id: String(user.id),
          name: user.username,
          role: roleKey,
          plan: user.subscriptionState === 'PREMIUM' ? 'premium' : 'basic',
        });

        const target = role === 'Technician' ? '/technician/dashboard' : '/owner/dashboard';
        this.router.navigate([target]);
      },
    });
  }

  /** Toggles the {@link showPassword} signal. */
  togglePasswordVisibility(): void {
    this.showPassword.update(visible => !visible);
  }

  /** Navigates to the registration view. */
  goToSignUp(): void {
    this.router.navigate(['/iam/sign-up']).then();
  }
}
