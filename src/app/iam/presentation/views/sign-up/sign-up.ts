import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { IamStore } from '@iam/application/iam-store.service';
import { IconComponent } from '@shared/presentation/components/icon/icon';

/** Role choices presented in the sign-up role picker. */
export type SignUpRole = 'Homeowner' | 'Technician';

/** UI-only descriptor for a role option displayed in the role grid. */
interface RoleOption {
  readonly label: string;
  readonly value: SignUpRole;
}

/**
 * Sign-up view for the Electrolink portal.
 *
 * Visual specification: Figma frame `4:1123` (Electrolink-EXP).
 *
 * ### State signals
 * - {@link selectedRole} — currently selected role tile (synced into the form
 *   via {@link selectRole}, ensuring the model is the single source of truth).
 *
 * ### External store dependencies
 * - {@link IamStore} — owns `signUp`, `loading`, `errorMessage`, and the
 *   `isAuthenticated` signal consulted after submission.
 *
 * ### Lifecycle
 * - `ngOnInit` builds the reactive form and wires the password-match validator.
 */
@Component({
  selector: 'app-sign-up',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUpComponent implements OnInit {
  /** IAM store driving the registration request and surfacing UI state. */
  readonly store = inject(IamStore);

  /** Router used to navigate back to sign-in or to the post-registration landing. */
  private readonly router = inject(Router);

  /** FormBuilder used to construct the reactive form during {@link ngOnInit}. */
  private readonly fb = inject(FormBuilder);

  /** Role currently highlighted in the role-tile group. */
  readonly selectedRole: WritableSignal<SignUpRole> = signal<SignUpRole>('Homeowner');

  /**
   * Reactive form backing the registration fields.
   * Shape: `{ role, username, password, confirmPassword, acceptedTerms }`.
   * The group-level validator emits `{ mismatch: true }` when the two
   * password fields diverge — consumed by the inline error in the template.
   */
  registerForm!: FormGroup;

  /** Static list of role tiles rendered by the template. */
  readonly roles: ReadonlyArray<RoleOption> = [
    { label: 'Homeowner',  value: 'Homeowner' },
    { label: 'Technician', value: 'Technician' },
  ];

  /** Builds the reactive form schema. Runs once per component instance. */
  ngOnInit(): void {
    this.registerForm = this.fb.group(
      {
        role: ['Homeowner' satisfies SignUpRole, Validators.required],
        username: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        acceptedTerms: [false, Validators.requiredTrue],
      },
      { validators: SignUpComponent.passwordMatchValidator },
    );
  }

  /**
   * Cross-field validator that flags mismatching password fields.
   *
   * @param group - The full form group, supplied by Angular Forms.
   * @returns `{ mismatch: true }` when the values diverge, otherwise `null`.
   */
  private static passwordMatchValidator(group: FormGroup): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  /**
   * Updates both the signal and the form when the user picks a role tile.
   *
   * @param role - Role chosen by the user.
   */
  selectRole(role: SignUpRole): void {
    this.selectedRole.set(role);
    this.registerForm.patchValue({ role });
  }

  /** Submits the registration payload. No-op when the form is invalid. */
  onSubmit(): void {
    if (!this.registerForm.valid) {
      return;
    }
    const { username, password, role } = this.registerForm.value;
    this.store.signUp({ username, password, roles: [role] }).subscribe({
      next: () => {
        if (this.store.isAuthenticated()) {
          this.router.navigate(['/']).then();
        }
      },
    });
  }

  /** Navigates back to the sign-in view. */
  goToSignIn(): void {
    this.router.navigate(['/iam/sign-in']).then();
  }
}
