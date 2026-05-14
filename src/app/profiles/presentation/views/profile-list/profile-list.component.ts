import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfilesStore } from '../../../application/profiles-store.service';
import { Profile, ProfileRole } from '../../../domain/model/profile.entity';

@Component({
  selector: 'app-profile-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="list-container">
      <div class="list-wrapper">

        <!-- Header -->
        <div class="list-header">
          <div class="header-left">
            <div class="header-icon">
              <span class="icon-circle">👥</span>
            </div>
            <div>
              <h1>Gestión de Perfiles</h1>
              <p>{{ filteredProfiles().length }} perfiles encontrados</p>
            </div>
          </div>
          <button class="btn-create" (click)="goToCreate()">
            <span class="btn-icon">+</span>
            Nuevo Perfil
          </button>
        </div>

        <!-- Filters -->
        <div class="filter-bar">
          <button
            class="filter-tab"
            [class.active]="activeFilter() === 'ALL'"
            (click)="setFilter('ALL')"
          >
            Todos
            <span class="tab-count">{{ allProfiles().length }}</span>
          </button>
          <button
            class="filter-tab"
            [class.active]="activeFilter() === 'HOMEOWNER'"
            (click)="setFilter('HOMEOWNER')"
          >
            🏠 Propietarios
            <span class="tab-count">{{ countByRole('HOMEOWNER') }}</span>
          </button>
          <button
            class="filter-tab"
            [class.active]="activeFilter() === 'TECHNICIAN'"
            (click)="setFilter('TECHNICIAN')"
          >
            ⚡ Técnicos
            <span class="tab-count">{{ countByRole('TECHNICIAN') }}</span>
          </button>
        </div>

        <!-- Loading state -->
        <div *ngIf="store.loading()" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Cargando perfiles...</p>
        </div>

        <!-- Error state -->
        <div *ngIf="store.errorMessage()" class="error-state">
          <span>⚠️</span>
          {{ store.errorMessage() }}
        </div>

        <!-- Empty state -->
        <div *ngIf="!store.loading() && filteredProfiles().length === 0" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No se encontraron perfiles</h3>
          <p>Comienza creando un nuevo perfil</p>
          <button class="btn-create-small" (click)="goToCreate()">
            + Crear Perfil
          </button>
        </div>

        <!-- Profile Cards Grid -->
        <div class="profiles-grid" *ngIf="!store.loading() && filteredProfiles().length > 0">
          <div
            class="profile-card"
            *ngFor="let profile of filteredProfiles(); trackBy: trackById"
          >
            <!-- Card Header -->
            <div class="card-header">
              <div class="avatar" [class.technician]="profile.isTechnician">
                {{ profile.firstName.charAt(0) }}{{ profile.lastName.charAt(0) }}
              </div>
              <div class="card-info">
                <h3>{{ profile.fullName }}</h3>
                <span class="email-text">{{ profile.email }}</span>
              </div>
              <span class="role-badge" [class.technician]="profile.isTechnician" [class.homeowner]="profile.isHomeOwner">
                {{ profile.isTechnician ? '⚡ Técnico' : '🏠 Propietario' }}
              </span>
            </div>

            <!-- Card Body -->
            <div class="card-body">
              <div class="detail-row" *ngIf="profile.dni">
                <span class="detail-label">DNI</span>
                <span class="detail-value">{{ profile.dni }}</span>
              </div>
              <div class="detail-row" *ngIf="profile.phoneNumber">
                <span class="detail-label">Teléfono</span>
                <span class="detail-value">{{ profile.phoneNumber }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Dirección</span>
                <span class="detail-value">{{ profile.street }}</span>
              </div>

              <!-- Technician-specific details -->
              <div class="detail-row" *ngIf="profile.isTechnician && profile.specialties">
                <span class="detail-label">Especialidades</span>
                <span class="detail-value highlight">{{ profile.specialties }}</span>
              </div>
              <div class="detail-row" *ngIf="profile.isTechnician && profile.yearsOfExperience">
                <span class="detail-label">Experiencia</span>
                <span class="detail-value">{{ profile.yearsOfExperience }} años</span>
              </div>
              <div class="detail-row" *ngIf="profile.isTechnician && profile.certificationCode">
                <span class="detail-label">Certificación</span>
                <span class="detail-value cert-badge">{{ profile.certificationCode }}</span>
              </div>

              <!-- HomeOwner-specific details -->
              <div class="detail-row" *ngIf="profile.isHomeOwner && profile.additionalInfo">
                <span class="detail-label">Info Adicional</span>
                <span class="detail-value">{{ profile.additionalInfo }}</span>
              </div>
            </div>

            <!-- Card Actions -->
            <div class="card-actions">
              <button class="btn-action edit" (click)="goToEdit(profile.id)">
                ✏️ Editar
              </button>
              <button class="btn-action delete" (click)="confirmDelete(profile)">
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>

        <!-- Delete confirmation modal -->
        <div class="modal-overlay" *ngIf="profileToDelete()" (click)="cancelDelete()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-icon">⚠️</div>
            <h3>¿Eliminar perfil?</h3>
            <p>Estás a punto de eliminar el perfil de <strong>{{ profileToDelete()?.fullName }}</strong>. Esta acción no se puede deshacer.</p>
            <div class="modal-actions">
              <button class="btn-modal cancel" (click)="cancelDelete()">Cancelar</button>
              <button class="btn-modal confirm" (click)="executeDelete()">Sí, Eliminar</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .list-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 2rem 1rem;
      color: #f8fafc;
    }

    .list-wrapper {
      max-width: 1100px;
      margin: 0 auto;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* --- Header --- */
    .list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .icon-circle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #0284c7, #4f46e5);
      border-radius: 0.875rem;
      font-size: 1.25rem;
      box-shadow: 0 10px 25px -5px rgba(2, 132, 199, 0.35);
    }

    .list-header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(to right, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .list-header p {
      color: #64748b;
      font-size: 0.85rem;
      margin: 0.15rem 0 0;
    }

    .btn-create {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: linear-gradient(135deg, #0284c7, #4f46e5);
      color: white;
      border: none;
      border-radius: 0.75rem;
      padding: 0.75rem 1.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .btn-create:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 20px -4px rgba(2, 132, 199, 0.4);
    }

    .btn-icon {
      font-size: 1.2rem;
      font-weight: 300;
    }

    /* --- Filter Bar --- */
    .filter-bar {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      background: rgba(255, 255, 255, 0.03);
      padding: 0.35rem;
      border-radius: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    .filter-tab {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      color: #64748b;
      padding: 0.6rem 1.2rem;
      border-radius: 0.5rem;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .filter-tab:hover {
      color: #cbd5e1;
      background: rgba(255, 255, 255, 0.04);
    }

    .filter-tab.active {
      color: #f8fafc;
      background: rgba(56, 189, 248, 0.12);
      box-shadow: 0 0 12px rgba(56, 189, 248, 0.08);
    }

    .tab-count {
      background: rgba(255, 255, 255, 0.08);
      padding: 0.1rem 0.5rem;
      border-radius: 1rem;
      font-size: 0.75rem;
    }

    .filter-tab.active .tab-count {
      background: rgba(56, 189, 248, 0.2);
    }

    /* --- Loading / Error / Empty --- */
    .loading-state, .error-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .loading-spinner {
      width: 2.5rem;
      height: 2.5rem;
      border: 3px solid rgba(56, 189, 248, 0.15);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-state p {
      color: #64748b;
      font-size: 0.9rem;
    }

    .error-state {
      flex-direction: row;
      gap: 0.5rem;
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.15);
      color: #fca5a5;
      padding: 1rem 1.5rem;
      border-radius: 0.75rem;
      font-size: 0.9rem;
    }

    .empty-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.1rem;
      color: #cbd5e1;
      margin: 0 0 0.35rem;
    }

    .empty-state p {
      color: #64748b;
      font-size: 0.85rem;
      margin: 0 0 1.25rem;
    }

    .btn-create-small {
      background: linear-gradient(135deg, #0284c7, #4f46e5);
      color: white;
      border: none;
      border-radius: 0.5rem;
      padding: 0.5rem 1.25rem;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s;
    }

    .btn-create-small:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 16px -4px rgba(2, 132, 199, 0.4);
    }

    /* --- Profiles Grid --- */
    .profiles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1.25rem;
    }

    @media (max-width: 720px) {
      .profiles-grid {
        grid-template-columns: 1fr;
      }
    }

    .profile-card {
      background: rgba(255, 255, 255, 0.04);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1rem;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .profile-card:hover {
      border-color: rgba(56, 189, 248, 0.2);
      transform: translateY(-3px);
      box-shadow: 0 16px 32px -8px rgba(0, 0, 0, 0.4);
    }

    /* Card Header */
    .card-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem 1.25rem 1rem;
      position: relative;
    }

    .avatar {
      width: 42px;
      height: 42px;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, #22c55e, #16a34a);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      color: white;
      flex-shrink: 0;
      text-transform: uppercase;
    }

    .avatar.technician {
      background: linear-gradient(135deg, #0284c7, #4f46e5);
    }

    .card-info {
      flex: 1;
      min-width: 0;
    }

    .card-info h3 {
      font-size: 0.95rem;
      font-weight: 600;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .email-text {
      font-size: 0.75rem;
      color: #64748b;
    }

    .role-badge {
      padding: 0.3rem 0.65rem;
      border-radius: 2rem;
      font-size: 0.7rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .role-badge.technician {
      background: rgba(56, 189, 248, 0.12);
      color: #38bdf8;
    }

    .role-badge.homeowner {
      background: rgba(34, 197, 94, 0.12);
      color: #22c55e;
    }

    /* Card Body */
    .card-body {
      padding: 0 1.25rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.45rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-size: 0.72rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-weight: 500;
    }

    .detail-value {
      font-size: 0.8rem;
      color: #cbd5e1;
      text-align: right;
      max-width: 60%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .detail-value.highlight {
      color: #38bdf8;
    }

    .cert-badge {
      background: rgba(129, 140, 248, 0.1);
      color: #818cf8;
      padding: 0.15rem 0.5rem;
      border-radius: 0.35rem;
      font-size: 0.72rem;
      font-weight: 600;
      font-family: 'SF Mono', 'Fira Code', monospace;
    }

    /* Card Actions */
    .card-actions {
      display: flex;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      margin-top: 0.75rem;
    }

    .btn-action {
      flex: 1;
      background: none;
      border: none;
      padding: 0.75rem;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .btn-action.edit {
      color: #38bdf8;
      border-right: 1px solid rgba(255, 255, 255, 0.06);
    }

    .btn-action.edit:hover {
      background: rgba(56, 189, 248, 0.08);
    }

    .btn-action.delete {
      color: #f87171;
    }

    .btn-action.delete:hover {
      background: rgba(239, 68, 68, 0.08);
    }

    /* --- Delete Modal --- */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.15s ease-out;
    }

    .modal-card {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.25rem;
      padding: 2rem;
      max-width: 400px;
      width: 90%;
      text-align: center;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .modal-icon {
      font-size: 2.5rem;
      margin-bottom: 0.75rem;
    }

    .modal-card h3 {
      font-size: 1.15rem;
      font-weight: 600;
      margin: 0 0 0.5rem;
    }

    .modal-card p {
      color: #94a3b8;
      font-size: 0.9rem;
      line-height: 1.5;
      margin: 0 0 1.5rem;
    }

    .modal-card strong {
      color: #f8fafc;
    }

    .modal-actions {
      display: flex;
      gap: 0.75rem;
    }

    .btn-modal {
      flex: 1;
      padding: 0.7rem 1rem;
      border-radius: 0.6rem;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      border: none;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .btn-modal.cancel {
      background: rgba(255, 255, 255, 0.06);
      color: #94a3b8;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-modal.cancel:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
    }

    .btn-modal.confirm {
      background: linear-gradient(135deg, #dc2626, #b91c1c);
      color: white;
    }

    .btn-modal.confirm:hover {
      box-shadow: 0 8px 16px -4px rgba(220, 38, 38, 0.4);
    }
  `]
})
export class ProfileListComponent implements OnInit {
  store = inject(ProfilesStore);
  private router = inject(Router);

  activeFilter = signal<'ALL' | ProfileRole>('ALL');
  profileToDelete = signal<Profile | null>(null);

  // Expose profiles from store for convenience
  allProfiles = this.store.profiles;

  ngOnInit(): void {
    this.store.loadProfiles().subscribe();
  }

  filteredProfiles(): Profile[] {
    const filter = this.activeFilter();
    const profiles = this.allProfiles();
    if (filter === 'ALL') return profiles;
    return profiles.filter(p => p.role === filter);
  }

  countByRole(role: ProfileRole): number {
    return this.allProfiles().filter(p => p.role === role).length;
  }

  setFilter(filter: 'ALL' | ProfileRole): void {
    this.activeFilter.set(filter);
  }

  trackById(_: number, profile: Profile): number {
    return profile.id;
  }

  goToCreate(): void {
    this.router.navigate(['/profiles/new']);
  }

  goToEdit(id: number): void {
    this.router.navigate(['/profiles', id, 'edit']);
  }

  confirmDelete(profile: Profile): void {
    this.profileToDelete.set(profile);
  }

  cancelDelete(): void {
    this.profileToDelete.set(null);
  }

  executeDelete(): void {
    const profile = this.profileToDelete();
    if (profile) {
      this.store.deleteProfile(profile.id).subscribe({
        next: () => this.profileToDelete.set(null)
      });
    }
  }
}
