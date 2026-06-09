import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IamStore } from '../../../application/iam-store.service';
import { AuthStore } from '../../../../shared/infrastructure/stores/auth.store';
import { IconComponent } from '../../../../shared/presentation/components/icon/icon';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, IconComponent],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignInComponent implements OnInit {
  store = inject(IamStore);
  authStore = inject(AuthStore);
  router = inject(Router);
  fb = inject(FormBuilder);

  selectedRole = signal<string>('Technician');
  showPassword = signal<boolean>(false);
  loginForm!: FormGroup;

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: [''],
      rememberMe: [false]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.store.signIn(this.loginForm.value).subscribe({
        next: () => {
          if (this.store.isAuthenticated()) {
            const user = this.store.currentUser()!;
            const role = user.roles?.[0];
            const roleKey = role === 'Technician' ? 'technician' : 'owner';
            this.authStore.login({
              id: String(user.id),
              name: user.username,
              role: roleKey as 'owner' | 'technician',
              plan: (user.subscriptionState === 'PREMIUM' ? 'premium' : 'basic') as 'basic' | 'premium'
            });
            if (role === 'Technician') {
              this.router.navigate(['/technician/dashboard']);
            } else {
              this.router.navigate(['/owner/dashboard']);
            }
          }
        }
      });
    }
  }

  goToSignUp() {
    this.router.navigate(['/iam/sign-up']);
  }
}
