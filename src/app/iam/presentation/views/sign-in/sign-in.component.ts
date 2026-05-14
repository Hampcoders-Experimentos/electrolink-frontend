import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IamStore } from '../../../application/iam-store.service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, CardModule, InputTextModule,
    PasswordModule, ButtonModule, MessageModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[var(--el-bg-soft)] p-4">
      <p-card styleClass="w-full max-w-md shadow-lg border-round-xl">
        <div class="text-center mb-5">
          <div class="flex justify-center items-center gap-2 mb-3">
            <i class="pi pi-bolt text-3xl" style="color: var(--el-primary)"></i>
            <span class="text-3xl font-bold" style="color: var(--el-primary)">ElectroLink</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800">Iniciar Sesión</h2>
          <p class="text-gray-500">Ingresa tus credenciales para continuar</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="username" class="font-semibold text-gray-700">Usuario o Email</label>
            <input 
              pInputText 
              id="username" 
              formControlName="username" 
              class="w-full p-3" 
              placeholder="nombre@ejemplo.com"
            />
          </div>

          <div class="flex flex-col gap-2">
            <label for="password" class="font-semibold text-gray-700">Contraseña</label>
            <p-password 
              id="password" 
              formControlName="password" 
              [toggleMask]="true" 
              [feedback]="false"
              styleClass="w-full"
              inputStyleClass="w-full p-3"
              placeholder="••••••••••••"
            ></p-password>
          </div>

          <p-message *ngIf="store.errorMessage()" severity="error">
            {{ store.errorMessage() }}
          </p-message>

          <p-button 
            type="submit" 
            label="Iniciar Sesión" 
            styleClass="w-full p-3 mt-2" 
            [disabled]="loginForm.invalid || store.loading()" 
            [loading]="store.loading()"
          ></p-button>
        </form>

        <div class="text-center mt-4">
          <p class="text-gray-600">¿Eres nuevo en la plataforma? 
            <a (click)="goToSignUp()" class="text-blue-500 font-semibold cursor-pointer hover:underline">Regístrate aquí</a>
          </p>
        </div>
      </p-card>
    </div>
  `
})
export class SignInComponent implements OnInit {
  store = inject(IamStore);
  router = inject(Router);
  fb = inject(FormBuilder);

  loginForm!: FormGroup;

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.store.signIn(this.loginForm.value).subscribe({
        next: () => {
          if (this.store.isAuthenticated()) {
            this.router.navigate(['/']);
          }
        }
      });
    }
  }

  goToSignUp() {
    this.router.navigate(['/iam/sign-up']);
  }
}
