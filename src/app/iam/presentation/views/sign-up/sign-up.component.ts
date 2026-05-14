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
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, CardModule, InputTextModule,
    PasswordModule, ButtonModule, MessageModule, SelectModule, CheckboxModule
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-[var(--el-bg-soft)] p-4">
      <p-card styleClass="w-full max-w-md shadow-lg border-round-xl">
        <div class="text-center mb-5">
          <div class="flex justify-center items-center gap-2 mb-3">
            <i class="pi pi-bolt text-3xl" style="color: var(--el-primary)"></i>
            <span class="text-3xl font-bold" style="color: var(--el-primary)">ElectroLink</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800">Crear Cuenta</h2>
          <p class="text-gray-500">Únete a la plataforma líder en gestión eléctrica</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="role" class="font-semibold text-gray-700">Selecciona tu Rol</label>
            <p-select 
              id="role" 
              formControlName="role" 
              [options]="roles" 
              optionLabel="label" 
              optionValue="value" 
              placeholder="Elige un rol"
              styleClass="w-full"
            ></p-select>
          </div>

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
              styleClass="w-full"
              inputStyleClass="w-full p-3"
              placeholder="••••••••••••"
            ></p-password>
          </div>

          <div class="flex flex-col gap-2">
            <label for="confirmPassword" class="font-semibold text-gray-700">Confirmar Contraseña</label>
            <p-password 
              id="confirmPassword" 
              formControlName="confirmPassword" 
              [toggleMask]="true" 
              [feedback]="false"
              styleClass="w-full"
              inputStyleClass="w-full p-3"
              placeholder="••••••••••••"
            ></p-password>
            <p-message *ngIf="registerForm.errors?.['mismatch'] && registerForm.get('confirmPassword')?.touched" severity="error">
              Las contraseñas no coinciden.
            </p-message>
          </div>

          <div class="flex items-center gap-2 mt-2">
            <p-checkbox formControlName="acceptedTerms" [binary]="true" inputId="terms"></p-checkbox>
            <label for="terms" class="text-sm text-gray-600">Acepto los Términos y Condiciones</label>
          </div>

          <p-message *ngIf="store.errorMessage()" severity="error">
            {{ store.errorMessage() }}
          </p-message>

          <p-button 
            type="submit" 
            label="Crear Cuenta" 
            styleClass="w-full p-3 mt-2" 
            [disabled]="registerForm.invalid || store.loading()" 
            [loading]="store.loading()"
          ></p-button>
        </form>

        <div class="text-center mt-4">
          <p class="text-gray-600">¿Ya tienes una cuenta? 
            <a (click)="goToSignIn()" class="text-blue-500 font-semibold cursor-pointer hover:underline">Inicia sesión aquí</a>
          </p>
        </div>
      </p-card>
    </div>
  `
})
export class SignUpComponent implements OnInit {
  store = inject(IamStore);
  router = inject(Router);
  fb = inject(FormBuilder);

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

