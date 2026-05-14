import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IamStore } from '../../../application/iam-store.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="userlist-container">
      <div class="table-card">
        <div class="header-actions">
          <div>
            <h2 class="title">Administración de Usuarios</h2>
            <p class="subtitle">Lista de cuentas registradas en la plataforma</p>
          </div>
          <button (click)="loadUsers()" class="btn-refresh" [disabled]="store.loading()">
            <span *ngIf="store.loading()" class="spinner"></span>
            <span *ngIf="!store.loading()">🔄 Actualizar</span>
          </button>
        </div>

        <div *ngIf="store.errorMessage()" class="alert-error">
          {{ store.errorMessage() }}
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario / Email</th>
                <th>Roles</th>
                <th>Suscripción</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of store.users()">
                <td class="cell-id">#{{ user.id }}</td>
                <td class="cell-name">{{ user.username }}</td>
                <td>
                  <div class="roles-badge-list">
                    <span *ngFor="let r of user.roles" class="badge-role">{{ r }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge-sub" [class.premium]="user.subscriptionState !== 'FREE'">
                    {{ user.subscriptionState }}
                  </span>
                </td>
                <td><span class="badge-active">Activo</span></td>
              </tr>
              <tr *ngIf="store.users().length === 0 && !store.loading()">
                <td colspan="5" class="empty-row">No se encontraron usuarios registrados.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .userlist-container {
        padding: 2rem;
        font-family: 'Inter', sans-serif;
        background-color: #f8fafc;
        min-height: calc(100vh - 64px);
      }
      .table-card {
        background: #ffffff;
        border-radius: 1rem;
        box-shadow:
          0 4px 6px -1px rgba(0, 0, 0, 0.05),
          0 2px 4px -1px rgba(0, 0, 0, 0.03);
        padding: 2rem;
        border: 1px solid #e2e8f0;
      }
      .header-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 2rem;
      }
      .title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 0.25rem;
      }
      .subtitle {
        color: #64748b;
        font-size: 0.9rem;
      }
      .btn-refresh {
        background: #0f172a;
        color: white;
        border: none;
        border-radius: 0.75rem;
        padding: 0.75rem 1.25rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.2s;
      }
      .btn-refresh:hover:not([disabled]) {
        background: #1e293b;
      }
      .alert-error {
        background: #fef2f2;
        border: 1px solid #fee2e2;
        color: #ef4444;
        padding: 1rem;
        border-radius: 0.75rem;
        margin-bottom: 1.5rem;
      }

      .table-responsive {
        overflow-x: auto;
      }
      .data-table {
        width: 100%;
        border-collapse: collapse;
        text-align: left;
      }
      .data-table th {
        padding: 1rem;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        color: #64748b;
        background-color: #f1f5f9;
        border-bottom: 1px solid #cbd5e1;
      }
      .data-table td {
        padding: 1.25rem 1rem;
        border-bottom: 1px solid #f1f5f9;
        color: #334155;
        font-size: 0.95rem;
      }
      .cell-id {
        font-weight: 600;
        color: #64748b;
      }
      .cell-name {
        font-weight: 600;
        color: #0f172a;
      }
      .roles-badge-list {
        display: flex;
        gap: 0.5rem;
      }
      .badge-role {
        background: #e0f2fe;
        color: #0284c7;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.25rem 0.65rem;
        border-radius: 9999px;
      }
      .badge-sub {
        background: #f1f5f9;
        color: #64748b;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.25rem 0.65rem;
        border-radius: 9999px;
      }
      .badge-sub.premium {
        background: #fef08a;
        color: #854d0e;
      }
      .badge-active {
        background: #dcfce7;
        color: #15803d;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.25rem 0.65rem;
        border-radius: 9999px;
      }
      .empty-row {
        text-align: center;
        color: #94a3b8;
        padding: 3rem !important;
      }
      .spinner {
        width: 1rem;
        height: 1rem;
        border: 2px solid white;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `
  ]
})
export class UserListComponent implements OnInit {
  store = inject(IamStore);

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.store.loadUsers().subscribe();
  }
}
