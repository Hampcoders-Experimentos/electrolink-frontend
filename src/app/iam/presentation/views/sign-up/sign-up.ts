import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IamStore } from '@iam/application/iam-store.service';
import { IconComponent } from '@shared/presentation/components/icon/icon';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.css',
})
export class SignUpComponent implements OnInit {
  store = inject(IamStore);
  router = inject(Router);
  fb = inject(FormBuilder);

  selectedRole = signal<string>('Homeowner');
  registerForm!: FormGroup;

  roles = [
    { label: 'Homeowner',  value: 'Homeowner' },
    { label: 'Technician', value: 'Technician' }
  ];

  ngOnInit() {
    this.registerForm = this.fb.group({
      role: ['Homeowner', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      acceptedTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  selectRole(role: string) {
    this.selectedRole.set(role);
    this.registerForm.patchValue({ role });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { username, password, role } = this.registerForm.value;
      this.store.signUp({ username, password, roles: [role] }).subscribe({
        next: () => {
          if (this.store.isAuthenticated()) {
            this.router.navigate(['/']);
          }
        }
      });
    }
  }

  goToSignIn() {
    this.router.navigate(['/iam/sign-in']);
  }
}
