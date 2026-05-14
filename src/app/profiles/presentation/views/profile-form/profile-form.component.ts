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
    <div class="el-form-page">
      <p-card styleClass="el-form-card">
        <div class="el-form-header">
          <div class="el-form-icon">@</div>
          <h1 class="el-form-title">{{ isEditMode ? 'Editar Perfil' : 'Completar tu Perfil' }}</h1>
          <p class="el-form-desc">
            {{ isEditMode ? 'Actualiza la información del perfil' : 'Ingresa tus datos para completar tu perfil en ElectroLink' }}
          </p>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="el-form">
          <p-fieldset legend="1. Información Personal" [toggleable]="true">
            <div class="el-grid-2">
              <div class="el-field">
                <label for="firstName" class="el-label">Nombre</label>
                <input pInputText id="firstName" formControlName="firstName" class="el-input" placeholder="Juan" />
                <small class="el-error" *ngIf="isFieldInvalid('firstName')">Nombre es requerido</small>
              </div>
              <div class="el-field">
                <label for="lastName" class="el-label">Apellido</label>
                <input pInputText id="lastName" formControlName="lastName" class="el-input" placeholder="Pérez" />
                <small class="el-error" *ngIf="isFieldInvalid('lastName')">Apellido es requerido</small>
              </div>
              <div class="el-field">
                <label for="dni" class="el-label">DNI / ID Number</label>
                <input pInputText id="dni" formControlName="dni" class="el-input" placeholder="12345678" />
              </div>
              <div class="el-field">
                <label for="phoneNumber" class="el-label">Teléfono</label>
                <input pInputText id="phoneNumber" formControlName="phoneNumber" class="el-input" placeholder="+1 (555) 000-0000" />
              </div>
              <div class="el-field el-col-span-2">
                <label for="email" class="el-label">Correo Electrónico</label>
                <input pInputText id="email" formControlName="email" type="email" class="el-input" placeholder="nombre@ejemplo.com" />
                <small class="el-error" *ngIf="isFieldInvalid('email')">Email válido es requerido</small>
              </div>
            </div>
          </p-fieldset>

          <p-fieldset legend="2. Selecciona tu Rol" [toggleable]="true">
            <div class="el-field">
              <p-select 
                [options]="roleOptions" 
                [(ngModel)]="selectedRole" 
                optionLabel="label" 
                optionValue="value" 
                styleClass="el-select-full"
                (onChange)="onRoleChange()">
              </p-select>
              <p class="el-role-hint">
                {{ selectedRole === 'HOMEOWNER' ? 'Busco servicios eléctricos y gestión de propiedades.' : 'Ofrezco servicios y catálogo especializado.' }}
              </p>
            </div>
          </p-fieldset>

          <p-fieldset legend="3. Detalles Profesionales" [toggleable]="true" *ngIf="selectedRole === 'TECHNICIAN'">
            <div class="el-grid-2">
              <div class="el-field el-col-span-2">
                <label for="specialties" class="el-label">Especialidades</label>
                <p-select
                  id="specialties"
                  formControlName="specialties"
                  [options]="specialtyOptions"
                  [editable]="true"
                  placeholder="Electricidad, Domótica, Paneles Solares..."
                  styleClass="el-select-full">
                </p-select>
              </div>
              <div class="el-field">
                <label for="yearsOfExperience" class="el-label">Años de Experiencia</label>
                <input pInputText type="number" id="yearsOfExperience" formControlName="yearsOfExperience" class="el-input" min="0" placeholder="5" />
              </div>
              <div class="el-field">
                <label for="certificationCode" class="el-label">Código de Certificación</label>
                <input pInputText id="certificationCode" formControlName="certificationCode" class="el-input" placeholder="CERT-EL-2024-001" />
              </div>
              <div class="el-field el-col-span-2">
                <label class="el-label">Certificaciones Oficiales (Opcional)</label>
                <p-fileUpload mode="basic" chooseLabel="Subir Certificado PDF" accept="application/pdf" maxFileSize="1000000" [auto]="true"></p-fileUpload>
              </div>
            </div>
          </p-fieldset>

          <p-fieldset legend="3. Información de Propiedad" [toggleable]="true" *ngIf="selectedRole === 'HOMEOWNER'">
            <div class="el-field">
              <label for="additionalInfo" class="el-label">Información Adicional</label>
              <textarea pTextarea id="additionalInfo" formControlName="additionalInfo" rows="4" class="el-textarea" placeholder="Describe tu propiedad..."></textarea>
            </div>
          </p-fieldset>

          <p-fieldset legend="{{ selectedRole === 'TECHNICIAN' ? '4. Zona de Cobertura' : '4. Dirección' }}" [toggleable]="true">
            <div class="el-field">
              <label for="street" class="el-label">Dirección Base</label>
              <input pInputText id="street" formControlName="street" class="el-input" placeholder="Av. Principal 1250, Ciudad" />
              <small class="el-error" *ngIf="isFieldInvalid('street')">Dirección es requerida</small>
            </div>

            <div *ngIf="selectedRole === 'TECHNICIAN'" class="el-coverage-box">
              <div class="el-coverage-info">
                <h4 class="el-coverage-title">Mapa de Cobertura</h4>
                <p class="el-coverage-desc">Define en el mapa tu zona exacta de trabajo.</p>
              </div>
              <p-button icon="pi pi-map-marker" label="Configurar Mapa" styleClass="p-button-outlined" (onClick)="showMapDialog()"></p-button>
            </div>
          </p-fieldset>

          <p-message *ngIf="store.errorMessage()" severity="error" [text]="store.errorMessage()!"></p-message>

          <div class="el-form-actions">
            <p-button type="button" label="Cancelar" severity="secondary" (onClick)="goBack()"></p-button>
            <p-button type="submit" [label]="isEditMode ? 'Guardar Cambios' : 'Completar Perfil'" styleClass="el-submit-btn" [disabled]="profileForm.invalid || store.loading()" [loading]="store.loading()"></p-button>
          </div>
        </form>
      </p-card>
    </div>

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
  `,
  styles: [`
    :host { display: block; }
    .el-form-page {
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      background: var(--el-bg-soft, #e8eef7);
      padding: 32px 16px;
    }

    .el-form-card {
      width: 100%;
      max-width: 896px;
      border-radius: 16px;
    }

    .el-form-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .el-form-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #0284c7, #4f46e5);
      border-radius: 16px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #ffffff;
      margin-bottom: 16px;
      box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.35);
    }

    .el-form-title {
      font-family: 'Inter', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: var(--el-primary, #2e3a59);
      margin: 0 0 8px;
    }

    .el-form-desc {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: var(--el-warm-gray, #a9b1ba);
      margin: 0;
    }

    .el-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .el-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .el-col-span-2 {
      grid-column: span 2;
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
      color: var(--el-primary, #2e3a59);
    }

    .el-input {
      width: 100%;
    }

    .el-textarea {
      width: 100%;
    }

    .el-select-full {
      width: 100%;
    }

    .el-error {
      color: #ef4444;
      font-size: 12px;
    }

    .el-role-hint {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      color: var(--el-warm-gray, #a9b1ba);
      margin: 8px 0 0;
    }

    .el-coverage-box {
      margin-top: 16px;
      padding: 16px;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .el-coverage-title {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #1e40af;
      margin: 0 0 4px;
    }

    .el-coverage-desc {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      color: #3b82f6;
      margin: 0;
    }

    .el-form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid #e5e7eb;
      padding-top: 16px;
    }

    .el-submit-btn {
      background: var(--el-primary, #2e3a59) !important;
      border: none !important;
    }
  `]
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
    { label: 'Propietario (Homeowner)', value: 'HOMEOWNER' },
    { label: 'Técnico Especializado', value: 'TECHNICIAN' }
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
