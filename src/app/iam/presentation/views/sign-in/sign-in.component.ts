import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IamStore } from '../../../application/iam-store.service';
import { AuthStore } from '../../../../shared/infrastructure/stores/auth.store';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, CardModule, InputTextModule,
    PasswordModule, ButtonModule, MessageModule, CheckboxModule
  ],
  template: `
    <div class="el-signin-container">
      <div class="el-signin-left">
        <div class="el-left-shape top-right"></div>
        <div class="el-left-shape bottom-left"></div>
        <div class="el-left-content">
          <div class="el-image-frame">
            <div class="el-image-placeholder">
              <i class="pi pi-bolt"></i>
            </div>
          </div>
          <h1 class="el-left-title">Empowering the Grid</h1>
          <p class="el-left-subtitle">
            Manage assets, track maintenance, and connect your<br>
            electrical infrastructure in one seamless interface.
          </p>
        </div>
      </div>

      <div class="el-signin-right">
        <div class="el-right-content">
          <div class="el-header-section">
            <div class="el-logo-box">
              <i class="pi pi-bolt"></i>
            </div>
            <h2 class="el-heading">Welcome back</h2>
            <p class="el-desc">Please enter your details to sign in.</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="el-form">
            <div class="el-field">
              <label class="el-label">I am a...</label>
              <div class="el-role-group">
                <button type="button" class="el-role-btn" [class.active]="selectedRole() === 'Technician'"
                  (click)="selectedRole.set('Technician')">Technician</button>
                <button type="button" class="el-role-btn" [class.active]="selectedRole() === 'Homeowner'"
                  (click)="selectedRole.set('Homeowner')">Owner</button>
              </div>
            </div>

            <div class="el-field">
              <label for="username" class="el-label">Email Address</label>
              <input pInputText id="username" formControlName="username" class="el-input" placeholder="name@electrolink.com" />
            </div>

            <div class="el-field">
              <div class="el-pw-header">
                <label for="password" class="el-label">Password</label>
                <span class="el-forgot">Forgot password?</span>
              </div>
              <p-password id="password" formControlName="password" [toggleMask]="true" [feedback]="false"
                styleClass="el-pw-wrap" inputStyleClass="el-input" placeholder="••••••••">
              </p-password>
            </div>

            <div class="el-remember">
              <p-checkbox formControlName="rememberMe" [binary]="true" inputId="rememberMe"></p-checkbox>
              <label for="rememberMe" class="el-remember-label">Remember this device</label>
            </div>

            <p-message *ngIf="store.errorMessage()" severity="error">{{ store.errorMessage() }}</p-message>

            <button pButton type="submit" class="el-submit" [disabled]="loginForm.invalid || store.loading()" [loading]="store.loading()">
              Sign In <i class="pi pi-arrow-right"></i>
            </button>
          </form>

          <div class="el-footer">
            New to the platform? <span class="el-footer-link" (click)="goToSignUp()">Request access</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100vh; }

    .el-signin-container {
      display: flex;
      height: 100vh;
    }

    /* Left Section */
    .el-signin-left {
      width: 768px;
      background: #2e3a59;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px;
      position: relative;
      overflow: hidden;
      flex-shrink: 0;
    }

    .el-left-shape {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
    }
    .el-left-shape.top-right {
      top: -80px; right: -80px;
      width: 256px; height: 256px;
      background: #b5d5f5;
      opacity: 0.1;
    }
    .el-left-shape.bottom-left {
      bottom: -128px; left: -128px;
      width: 384px; height: 384px;
      background: #ffe492;
      opacity: 0.1;
    }

    .el-left-content {
      max-width: 512px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: relative;
      z-index: 1;
    }

    .el-image-frame {
      width: 512px;
      height: 512px;
      border: 4px solid rgba(181, 213, 245, 0.2);
      border-radius: 8px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      overflow: hidden;
    }

    .el-image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a2332 0%, #2e3a59 50%, #3d4f75 100%);
    }
    .el-image-placeholder i {
      font-size: 128px;
      color: rgba(181, 213, 245, 0.15);
    }

    .el-left-title {
      font-family: 'Inter', sans-serif;
      font-size: 36px;
      font-weight: 700;
      color: #ffffff;
      text-align: center;
      line-height: 40px;
      margin: 0;
    }

    .el-left-subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 18px;
      font-weight: 500;
      color: #b5d5f5;
      text-align: center;
      line-height: 28px;
      margin: 0;
    }

    /* Right Section */
    .el-signin-right {
      flex: 1;
      background: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px;
    }

    .el-right-content {
      max-width: 448px;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 40px;
    }

    .el-header-section {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .el-logo-box {
      width: 48px;
      height: 48px;
      background: #2e3a59;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .el-logo-box i {
      font-size: 24px;
      color: #ffffff;
    }

    .el-heading {
      font-family: 'Inter', sans-serif;
      font-size: 30px;
      font-weight: 700;
      color: #2e3a59;
      line-height: 36px;
      letter-spacing: -0.75px;
      margin: 0;
      padding-top: 8px;
    }

    .el-desc {
      font-family: 'Inter', sans-serif;
      font-size: 16px;
      font-weight: 400;
      color: #a9b1ba;
      line-height: 24px;
      margin: 0;
    }

    /* Form */
    .el-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .el-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .el-label {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #2e3a59;
      line-height: 20px;
    }

    .el-role-group {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border: 1px solid rgba(169, 177, 186, 0.3);
      border-radius: 8px;
      overflow: hidden;
      padding: 1px;
    }

    .el-role-btn {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 500;
      padding: 10px 0;
      border: none;
      cursor: pointer;
      background: #ffffff;
      color: #a9b1ba;
      text-align: center;
      transition: background 0.2s, color 0.2s;
    }
    .el-role-btn.active {
      background: #2e3a59;
      color: #ffffff;
    }

    .el-input {
      width: 100% !important;
      padding: 15px 17px !important;
      border: 1px solid rgba(169, 177, 186, 0.3) !important;
      border-radius: 8px !important;
      font-family: 'Inter', sans-serif !important;
      font-size: 16px !important;
      background: #ffffff !important;
      box-sizing: border-box !important;
    }
    .el-input::placeholder {
      color: rgba(169, 177, 186, 0.6);
    }

    .el-pw-wrap {
      width: 100%;
      display: block;
    }

    .el-pw-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .el-forgot {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #1978e5;
      cursor: pointer;
    }

    .el-remember {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .el-remember-label {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: #2e3a59;
      line-height: 20px;
      cursor: pointer;
    }

    .el-submit {
      width: 100% !important;
      background: #2e3a59 !important;
      border: none !important;
      border-radius: 8px !important;
      padding: 14px !important;
      font-family: 'Inter', sans-serif !important;
      font-size: 16px !important;
      font-weight: 700 !important;
      color: #ffffff !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 8px !important;
      box-shadow: 0 10px 25px -5px rgba(46, 58, 89, 0.1), 0 8px 10px -6px rgba(46, 58, 89, 0.1) !important;
    }

    .el-footer {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 400;
      color: #a9b1ba;
      text-align: center;
      line-height: 20px;
    }

    .el-footer-link {
      font-weight: 700;
      color: #2e3a59;
      cursor: pointer;
    }
  `]
})
export class SignInComponent implements OnInit {
  store = inject(IamStore);
  authStore = inject(AuthStore);
  router = inject(Router);
  fb = inject(FormBuilder);

  selectedRole = signal<string>('Technician');
  loginForm!: FormGroup;

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      // password: ['', Validators.required], // disabled for mock server testing — no password field in user JSON
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
