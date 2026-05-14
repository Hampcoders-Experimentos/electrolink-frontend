import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfilesStore } from '../../../application/profiles-store.service';
import { ProfileRole } from '../../../domain/model/profile.entity';
import { CardModule } from 'primeng/card';
import { FieldsetModule } from 'primeng/fieldset';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { TechnicianCoverageComponent } from '../technician-coverage/technician-coverage.component';

@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, FormsModule, CardModule, FieldsetModule,
    InputTextModule, TextareaModule, SelectModule, FileUploadModule,
    ButtonModule, DialogModule, MessageModule, TechnicianCoverageComponent
  ],
  template: `
    <div class="min-h-screen flex items-start justify-center bg-[var(--el-bg-soft)] p-4 md:p-8">
      <p-card styleClass="w-full max-w-4xl shadow-xl border-round-2xl border border-[var(--el-warm-gray)]">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg text-white text-2xl">
            👤
          </div>
          <h1 class="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            {{ isEditMode ? 'Editar Perfil' : 'Completar tu Perfil' }}
          </h1>
          <p class="text-gray-500 mt-2">
            {{ isEditMode ? 'Actualiza la información del perfil' : 'Ingresa tus datos para completar tu perfil en ElectroLink' }}
          </p>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-6">
          
          <p-fieldset legend="1. Información Personal" [toggleable]="true">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <label for="firstName" class="font-medium text-gray-700">Nombre</label>
                <input pInputText id="firstName" formControlName="firstName" class="w-full" placeholder="Juan" />
                <small class="text-red-500" *ngIf="isFieldInvalid('firstName')">Nombre es requerido</small>
              </div>
              <div class="flex flex-col gap-2">
                <label for="lastName" class="font-medium text-gray-700">Apellido</label>
                <input pInputText id="lastName" formControlName="lastName" class="w-full" placeholder="Pérez" />
                <small class="text-red-500" *ngIf="isFieldInvalid('lastName')">Apellido es requerido</small>
              </div>
              <div class="flex flex-col gap-2">
                <label for="dni" class="font-medium text-gray-700">DNI / ID Number</label>
                <input pInputText id="dni" formControlName="dni" class="w-full" placeholder="12345678" />
              </div>
              <div class="flex flex-col gap-2">
                <label for="phoneNumber" class="font-medium text-gray-700">Teléfono</label>
                <input pInputText id="phoneNumber" formControlName="phoneNumber" class="w-full" placeholder="+1 (555) 000-0000" />
              </div>
              <div class="flex flex-col gap-2 md:col-span-2">
                <label for="email" class="font-medium text-gray-700">Correo Electrónico</label>
                <input pInputText id="email" formControlName="email" type="email" class="w-full" placeholder="nombre@ejemplo.com" />
                <small class="text-red-500" *ngIf="isFieldInvalid('email')">Email válido es requerido</small>
              </div>
            </div>
          </p-fieldset>

          <p-fieldset legend="2. Selecciona tu Rol" [toggleable]="true">
            <div class="flex flex-col gap-2">
              <p-select 
                [options]="roleOptions" 
                [(ngModel)]="selectedRole" 
                optionLabel="label" 
                optionValue="value" 
                styleClass="w-full"
                (onChange)="onRoleChange()">
              </p-select>
              <p class="text-sm text-gray-500 mt-2">
                {{ selectedRole === 'HOMEOWNER' ? 'Busco servicios eléctricos y gestión de propiedades.' : 'Ofrezco servicios y catálogo especializado.' }}
              </p>
            </div>
          </p-fieldset>

          <!-- Technician Fields -->
          <p-fieldset legend="3. Detalles Profesionales" [toggleable]="true" *ngIf="selectedRole === 'TECHNICIAN'">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-2 md:col-span-2">
                <label for="specialties" class="font-medium text-gray-700">Especialidades</label>
                <p-select
                  id="specialties"
                  formControlName="specialties"
                  [options]="specialtyOptions"
                  [editable]="true"
                  placeholder="Electricidad, Domótica, Paneles Solares..."
                  styleClass="w-full">
                </p-select>
              </div>
              <div class="flex flex-col gap-2">
                <label for="yearsOfExperience" class="font-medium text-gray-700">Años de Experiencia</label>
                <input pInputText type="number" id="yearsOfExperience" formControlName="yearsOfExperience" class="w-full" min="0" placeholder="5" />
              </div>
              <div class="flex flex-col gap-2">
                <label for="certificationCode" class="font-medium text-gray-700">Código de Certificación</label>
                <input pInputText id="certificationCode" formControlName="certificationCode" class="w-full" placeholder="CERT-EL-2024-001" />
              </div>
              <div class="flex flex-col gap-2 md:col-span-2 mt-2">
                <label class="font-medium text-gray-700">Certificaciones Oficiales (Opcional)</label>
                <p-fileUpload mode="basic" chooseLabel="Subir Certificado PDF" accept="application/pdf" maxFileSize="1000000" [auto]="true"></p-fileUpload>
              </div>
            </div>
          </p-fieldset>

          <!-- HomeOwner Fields -->
          <p-fieldset legend="3. Información de Propiedad" [toggleable]="true" *ngIf="selectedRole === 'HOMEOWNER'">
            <div class="flex flex-col gap-2">
              <label for="additionalInfo" class="font-medium text-gray-700">Información Adicional</label>
              <textarea pTextarea id="additionalInfo" formControlName="additionalInfo" rows="4" class="w-full" placeholder="Describe tu propiedad..."></textarea>
            </div>
          </p-fieldset>

          <p-fieldset legend="{{ selectedRole === 'TECHNICIAN' ? '4. Zona de Cobertura' : '4. Dirección' }}" [toggleable]="true">
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label for="street" class="font-medium text-gray-700">Dirección Base</label>
                <input pInputText id="street" formControlName="street" class="w-full" placeholder="Av. Principal 1250, Ciudad" />
                <small class="text-red-500" *ngIf="isFieldInvalid('street')">Dirección es requerida</small>
              </div>

              <div *ngIf="selectedRole === 'TECHNICIAN'" class="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                <div>
                  <h4 class="font-semibold text-blue-900">Mapa de Cobertura</h4>
                  <p class="text-sm text-blue-700">Define en el mapa tu zona exacta de trabajo.</p>
                </div>
                <p-button icon="pi pi-map-marker" label="Configurar Mapa" styleClass="p-button-outlined" (onClick)="showMapDialog()"></p-button>
              </div>
            </div>
          </p-fieldset>

          <p-message *ngIf="store.errorMessage()" severity="error" [text]="store.errorMessage()!"></p-message>

          <div class="flex justify-end gap-3 mt-4 border-t border-gray-100 pt-4">
            <p-button type="button" label="Cancelar" severity="secondary" (onClick)="goBack()"></p-button>
            <p-button type="submit" [label]="isEditMode ? 'Guardar Cambios' : 'Completar Perfil'" styleClass="bg-[var(--el-primary)] border-none" [disabled]="profileForm.invalid || store.loading()" [loading]="store.loading()"></p-button>
          </div>
        </form>
      </p-card>
    </div>

    <!-- Map Dialog -->
    <p-dialog header="Zona de Cobertura" [(visible)]="displayMap" [modal]="true" [style]="{width: '90vw', maxWidth: '800px'}">
      <app-technician-coverage 
        *ngIf="displayMap"
        [initialLatitude]="latitude"
        [initialLongitude]="longitude"
        [initialRadius]="coverageRadius"
        (saveCoverage)="onCoverageSaved($event)"
        (cancel)="displayMap = false">
      </app-technician-coverage>
    </p-dialog>
  `
})
export class ProfileFormComponent implements OnInit {
  store = inject(ProfilesStore);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  profileForm!: FormGroup;
  isEditMode = false;
  editId: number | null = null;
  selectedRole: ProfileRole = 'HOMEOWNER';
  
  displayMap = false;
  latitude?: number;
  longitude?: number;
  coverageRadius = 5000;

  roleOptions = [
    { label: '🏠 Propietario (Homeowner)', value: 'HOMEOWNER' },
    { label: '⚡ Técnico Especializado', value: 'TECHNICIAN' }
  ];

  specialtyOptions = [
    'Instalación Eléctrica General',
    'Mantenimiento de Paneles Solares',
    'Domótica y Smart Home',
    'Reparación de Electrodomésticos',
    'Redes de Alta Tensión'
  ];

  ngOnInit(): void {
    this.buildForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.editId = Number(idParam);
      this.loadProfile(this.editId);
    }
  }

  private buildForm(): void {
    this.profileForm = this.fb.group({
      firstName:    ['', [Validators.required, Validators.maxLength(30)]],
      lastName:     ['', [Validators.required, Validators.maxLength(30)]],
      email:        ['', [Validators.required, Validators.email]],
      street:       ['', [Validators.required, Validators.maxLength(100)]],
      dni:          [''],
      phoneNumber:  [''],
      specialties:  [''],
      yearsOfExperience: [0],
      certificationCode: [''],
      additionalInfo: ['']
    });
  }

  private loadProfile(id: number): void {
    this.store.loadProfileById(id).subscribe({
      next: profile => {
        this.selectedRole = profile.role;
        this.latitude = profile.latitude;
        this.longitude = profile.longitude;
        if (profile.coverageRadius) {
          this.coverageRadius = profile.coverageRadius;
        }
        
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          street: profile.street,
          dni: profile.dni,
          phoneNumber: profile.phoneNumber,
          specialties: profile.specialties,
          yearsOfExperience: profile.yearsOfExperience,
          certificationCode: profile.certificationCode,
          additionalInfo: profile.additionalInfo
        });
      }
    });
  }

  onRoleChange() {
    // Optionally reset fields based on role switch
  }

  isFieldInvalid(field: string): boolean {
    const control = this.profileForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  showMapDialog() {
    this.displayMap = true;
  }

  onCoverageSaved(event: { latitude: number, longitude: number, radius: number }) {
    this.latitude = event.latitude;
    this.longitude = event.longitude;
    this.coverageRadius = event.radius;
    this.displayMap = false;
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    const formData = this.profileForm.value;
    const resource = {
      ...formData,
      role: this.selectedRole,
      latitude: this.latitude,
      longitude: this.longitude,
      coverageRadius: this.coverageRadius
    };

    if (this.isEditMode && this.editId) {
      const updateResource = { ...resource, id: this.editId };
      this.store.updateProfile(updateResource, this.editId).subscribe({
        next: () => this.router.navigate(['/profiles'])
      });
    } else {
      this.store.createProfile(resource).subscribe({
        next: () => this.router.navigate(['/profiles'])
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/profiles']);
  }
}
