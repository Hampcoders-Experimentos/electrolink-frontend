import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AssetsStoreService } from '../../../application/assets-store.service';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="property-form-container">
      <div class="property-card">
        <!-- Header -->
        <div class="form-header">
          <div class="header-icon">
            <span class="icon-circle">🏢</span>
          </div>
          <h1>{{ isEditMode ? 'Editar Propiedad' : 'Registrar Propiedad' }}</h1>
          <p>{{ isEditMode ? 'Actualiza los datos de tu propiedad' : 'Ingresa la información de la nueva propiedad en ElectroLink' }}</p>
        </div>

        <form [formGroup]="propertyForm" (ngSubmit)="onSubmit()" class="form-sections">

          <!-- SECTION 1: Address & Location -->
          <div class="section">
            <div class="section-header">
              <span class="section-number">1</span>
              <h3>Ubicación de la Propiedad</h3>
            </div>

            <div class="form-group">
              <label for="address">Dirección completa</label>
              <input
                type="text"
                id="address"
                formControlName="address"
                placeholder="Av. Los Pinos 450, Dpto 302"
                class="form-control"
                [class.error]="isFieldInvalid('address')"
              />
              <span class="error-text" *ngIf="isFieldInvalid('address')">La dirección es requerida</span>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="region">Región / Estado</label>
                <input
                  type="text"
                  id="region"
                  formControlName="region"
                  placeholder="Lima"
                  class="form-control"
                  [class.error]="isFieldInvalid('region')"
                />
                <span class="error-text" *ngIf="isFieldInvalid('region')">La región es requerida</span>
              </div>

              <div class="form-group">
                <label for="district">Distrito / Ciudad</label>
                <input
                  type="text"
                  id="district"
                  formControlName="district"
                  placeholder="Miraflores"
                  class="form-control"
                  [class.error]="isFieldInvalid('district')"
                />
                <span class="error-text" *ngIf="isFieldInvalid('district')">El distrito es requerido</span>
              </div>
            </div>
          </div>

          <!-- SECTION 2: Ownership -->
          <div class="section">
            <div class="section-header">
              <span class="section-number">2</span>
              <h3>Asignación de Propietario</h3>
            </div>

            <div class="form-group">
              <label for="ownerId">ID del Propietario</label>
              <input
                type="number"
                id="ownerId"
                formControlName="ownerId"
                placeholder="1"
                class="form-control"
                min="1"
                [class.error]="isFieldInvalid('ownerId')"
              />
              <span class="hint-text">Ingresa el ID numérico del usuario propietario asignado</span>
            </div>
          </div>

          <!-- Error message -->
          <div *ngIf="store.errorMessage()" class="alert-error">
            <span class="alert-icon">⚠️</span>
            {{ store.errorMessage() }}
          </div>

          <!-- Actions -->
          <div class="form-actions">
            <button type="button" class="btn-secondary" (click)="goBack()">
              ← Cancelar
            </button>
            <button
              type="submit"
              [disabled]="propertyForm.invalid || store.loading()"
              class="btn-primary"
            >
              <span *ngIf="store.loading()" class="spinner"></span>
              <span *ngIf="!store.loading()">
                {{ isEditMode ? '💾 Guardar Cambios' : '✓ Registrar Propiedad' }}
              </span>
            </button>
          </div>

        </form>
      </div>
    </div>
  `,
  styles: [`
    .property-form-container {
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 2rem 1rem;
    }

    .property-card {
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1.5rem;
      padding: 2.5rem;
      width: 100%;
      max-width: 680px;
      box-shadow:
        0 25px 50px -12px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.05);
      color: #f8fafc;
      animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* --- Header --- */
    .form-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .header-icon {
      margin-bottom: 1rem;
    }

    .icon-circle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #0284c7, #4f46e5);
      border-radius: 1rem;
      font-size: 1.5rem;
      box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.4);
    }

    .form-header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      margin: 0 0 0.5rem;
      background: linear-gradient(to right, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .form-header p {
      color: #94a3b8;
      font-size: 0.95rem;
      margin: 0;
    }

    /* --- Sections --- */
    .form-sections {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .section {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 1rem;
      padding: 1.5rem;
      transition: border-color 0.3s ease;
    }

    .section:hover {
      border-color: rgba(56, 189, 248, 0.15);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .section-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #0284c7, #4f46e5);
      border-radius: 50%;
      font-size: 0.8rem;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .section-header h3 {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
      color: #e2e8f0;
    }

    /* --- Form Fields --- */
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    @media (max-width: 560px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-bottom: 1rem;
    }

    .form-group:last-child {
      margin-bottom: 0;
    }

    .form-group label {
      font-size: 0.8rem;
      font-weight: 500;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .form-control {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      color: #f8fafc;
      font-size: 0.95rem;
      font-family: inherit;
      transition: all 0.2s ease;
    }

    .form-control::placeholder {
      color: #475569;
    }

    .form-control:focus {
      outline: none;
      border-color: #38bdf8;
      box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
    }

    .form-control.error {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .error-text {
      color: #fca5a5;
      font-size: 0.75rem;
    }

    .hint-text {
      color: #64748b;
      font-size: 0.75rem;
      font-style: italic;
    }

    /* --- Alert --- */
    .alert-error {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.2);
      color: #fca5a5;
      padding: 0.75rem 1rem;
      border-radius: 0.75rem;
      font-size: 0.875rem;
    }

    .alert-icon {
      flex-shrink: 0;
    }

    /* --- Actions --- */
    .form-actions {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding-top: 0.5rem;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #94a3b8;
      border-radius: 0.75rem;
      padding: 0.85rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
    }

    .btn-primary {
      background: linear-gradient(135deg, #0284c7, #4f46e5);
      color: white;
      border: none;
      border-radius: 0.75rem;
      padding: 0.85rem 2rem;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-family: inherit;
      flex: 1;
      max-width: 260px;
    }

    .btn-primary:hover:not([disabled]) {
      transform: translateY(-2px);
      box-shadow: 0 12px 20px -4px rgba(2, 132, 199, 0.4);
    }

    .btn-primary[disabled] {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinner {
      width: 1.2rem;
      height: 1.2rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class PropertyFormComponent implements OnInit {
  store = inject(AssetsStoreService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  propertyForm!: FormGroup;
  isEditMode = false;
  editId: string | number | null = null;

  ngOnInit(): void {
    this.buildForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.editId = idParam;
      this.loadProperty(this.editId);
    }
  }

  private buildForm(): void {
    this.propertyForm = this.fb.group({
      address: ['', [Validators.required, Validators.maxLength(150)]],
      region:  ['', [Validators.required, Validators.maxLength(50)]],
      district: ['', [Validators.required, Validators.maxLength(50)]],
      ownerId: [1, [Validators.required, Validators.min(1)]]
    });
  }

  private loadProperty(id: string | number): void {
    this.store.loadPropertyById(id).subscribe({
      next: property => {
        this.propertyForm.patchValue({
          address: property.address,
          region: property.region,
          district: property.district,
          ownerId: property.ownerId
        });
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.propertyForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.propertyForm.invalid) return;

    const formData = this.propertyForm.value;
    const resource = {
      ...formData,
      photos: []
    };

    if (this.isEditMode && this.editId) {
      const updateResource = { ...resource, id: this.editId };
      this.store.updateProperty(updateResource, this.editId).subscribe({
        next: () => this.router.navigate(['/assets'])
      });
    } else {
      this.store.addProperty(resource).subscribe({
        next: () => this.router.navigate(['/assets'])
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/assets']);
  }
}
