import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IamStore } from '../../../application/iam-store.service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, CardModule, InputTextModule,
    PasswordModule, ButtonModule, MessageModule, CheckboxModule
  ],
  template: `
    <div class="el-signup-page">
      <div class="el-signup-card-wrapper">
        <div class="el-signup-card">
          <div class="el-signup-brand">
            <div class="el-signup-brand-row">
              <i class="pi pi-bolt"></i>
              <span class="el-signup-brand-name">ElectroLink</span>
            </div>
            <p class="el-signup-brand-desc">Join the network of professional energy solutions</p>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="el-signup-form">
            <div class="el-field">
              <label class="el-label">Select your role</label>
              <div class="el-role-grid">
                <button type="button" class="el-role-card" [class.active]="selectedRole() === 'Homeowner'"
                  (click)="selectRole('Homeowner')">
                  <span class="el-role-label">Homeowner</span>
                </button>
                <button type="button" class="el-role-card" [class.active]="selectedRole() === 'Technician'"
                  (click)="selectRole('Technician')">
                  <span class="el-role-label">Technician</span>
                </button>
              </div>
            </div>

            <div class="el-field">
              <label for="username" class="el-label">Email Address</label>
              <input pInputText id="username" formControlName="username" class="el-input" placeholder="name@example.com" />
            </div>

            <div class="el-field">
              <label for="password" class="el-label">Password</label>
              <p-password id="password" formControlName="password" [toggleMask]="true"
                styleClass="el-pw-wrap" inputStyleClass="el-input" placeholder="••••••••">
              </p-password>
            </div>

            <div class="el-field">
              <label for="confirmPassword" class="el-label">Confirm Password</label>
              <p-password id="confirmPassword" formControlName="confirmPassword" [toggleMask]="true" [feedback]="false"
                styleClass="el-pw-wrap" inputStyleClass="el-input" placeholder="••••••••">
              </p-password>
              <p-message *ngIf="registerForm.errors?.['mismatch'] && registerForm.get('confirmPassword')?.touched"
                severity="error" styleClass="el-field-error">
                Las contraseñas no coinciden.
              </p-message>
            </div>

            <div class="el-terms-row">
              <p-checkbox formControlName="acceptedTerms" [binary]="true" inputId="terms"></p-checkbox>
              <label for="terms" class="el-terms-label">
                I agree to the <span class="el-terms-link">Terms of Service</span> and <span class="el-terms-link">Privacy Policy</span>.
              </label>
            </div>

            <p-message *ngIf="store.errorMessage()" severity="error">{{ store.errorMessage() }}</p-message>

            <button pButton type="submit" class="el-submit-btn"
              [disabled]="registerForm.invalid || store.loading()" [loading]="store.loading()">
              Create Account
            </button>
          </form>

          <div class="el-signup-divider"></div>

          <div class="el-signup-footer">
            Already have an account? <span class="el-signup-footer-link" (click)="goToSignIn()">Sign in</span>
          </div>
        </div>

        <div class="el-signup-badges">
          <div class="el-badge">
            <i class="pi pi-lock"></i>
            <span>SECURE SSL</span>
          </div>
          <span class="el-badge-dot">•</span>
          <div class="el-badge">
            <i class="pi pi-headphones"></i>
            <span>24/7 SUPPORT</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .el-signup-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e8eef7;
      padding: 16px;
    }

    .el-signup-card-wrapper {
      display: flex;
      flex-direction: column;
      gap: 24px;
      align-items: center;
      max-width: 448px;
      width: 100%;
    }

    .el-signup-card {
      width: 100%;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(5px);
      border: 1px solid #ffffff;
      border-radius: 8px;
      padding: 41px;
      box-shadow: 0 8px 32px 0 rgba(46, 58, 89, 0.1);
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    /* Brand */
    .el-signup-brand {
      display: flex;
      flex-direction: column;
      gap: 8px;
      align-items: center;
    }

    .el-signup-brand-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .el-signup-brand-row i {
      font-size: 32px;
      color: #2e3a59;
    }
    .el-signup-brand-name {
      font-family: 'Inter', sans-serif;
      font-size: 24px;
      font-weight: 700;
      color: #2e3a59;
      line-height: 32px;
    }

    .el-signup-brand-desc {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: #000000;
      line-height: 20px;
      margin: 0;
      text-align: center;
    }

    /* Form */
    .el-signup-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .el-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .el-label {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #2e3a59;
      line-height: 20px;
    }

    /* Role Grid */
    .el-role-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .el-role-card {
      border: 2px solid #b5d5f5;
      border-radius: 8px;
      padding: 18px;
      background: #ffffff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s, border-color 0.2s, color 0.2s;
    }
    .el-role-card.active {
      background: #f0f7ff;
      border-color: #1978e5;
    }

    .el-role-label {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 500;
      color: #2e3a59;
      line-height: 20px;
    }
    .el-role-card.active .el-role-label {
      color: #1978e5;
    }

    /* Input */
    .el-input {
      width: 100% !important;
      padding: 15px 17px !important;
      border: 1px solid #b5d5f5 !important;
      border-radius: 8px !important;
      font-family: 'Inter', sans-serif !important;
      font-size: 16px !important;
      background: #ffffff !important;
      box-sizing: border-box !important;
    }
    .el-input::placeholder {
      color: #6b7280;
    }

    .el-pw-wrap {
      width: 100%;
      display: block;
    }

    .el-field-error {
      margin-top: 4px;
    }

    /* Terms */
    .el-terms-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .el-terms-label {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: #000000;
      line-height: 20px;
      cursor: pointer;
    }

    .el-terms-link {
      font-weight: 500;
      color: #1978e5;
      cursor: pointer;
    }

    /* Submit */
    .el-submit-btn {
      width: 100% !important;
      background: #1978e5 !important;
      border: none !important;
      border-radius: 8px !important;
      padding: 12px 16px !important;
      font-family: 'Inter', sans-serif !important;
      font-size: 16px !important;
      font-weight: 700 !important;
      color: #ffffff !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.2), 0 4px 6px -4px rgba(59, 130, 246, 0.2) !important;
    }

    .el-signup-divider {
      border-top: 1px solid rgba(181, 213, 245, 0.5);
    }

    .el-signup-footer {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: #000000;
      text-align: center;
      line-height: 20px;
    }

    .el-signup-footer-link {
      font-weight: 600;
      color: #2e3a59;
      cursor: pointer;
    }

    /* Badges */
    .el-signup-badges {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }

    .el-badge {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .el-badge i {
      font-size: 16px;
    }
    .el-badge span {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: #000000;
      letter-spacing: 1.2px;
      line-height: 16px;
    }

    .el-badge-dot {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: #000000;
    }
  `]
})
export class SignUpComponent implements OnInit {
  store = inject(IamStore);
  router = inject(Router);
  fb = inject(FormBuilder);

  selectedRole = signal<string>('Homeowner');
  registerForm!: FormGroup;

  roles = [
    { label: 'Propietario', value: 'Homeowner' },
    { label: 'Técnico', value: 'Technician' }
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
