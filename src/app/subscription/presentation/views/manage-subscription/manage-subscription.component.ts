import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionStore } from '../../../application/subscription-store.service';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-manage-subscription',
  standalone: true,
  imports: [
    CommonModule, CardModule, TagModule, ButtonModule, ProgressBarModule,
    ConfirmDialogModule, MessageModule, ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  template: `
    <div class="app-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo-icon">E</div>
          <span class="logo-text">ElectroLink</span>
        </div>

        <nav class="sidebar-nav">
          <a class="nav-item" (click)="navigate('/profiles')">
            <span class="nav-icon">👤</span>
            <span class="nav-label">My Profile</span>
          </a>
          <a class="nav-item active">
            <span class="nav-icon">💳</span>
            <span class="nav-label">Subscription</span>
          </a>
          <a class="nav-item" (click)="navigate('/profiles')">
            <span class="nav-icon">🏢</span>
            <span class="nav-label">Projects</span>
          </a>
          <a class="nav-item" (click)="navigate('/iam')">
            <span class="nav-icon">⚙️</span>
            <span class="nav-label">Settings</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <button class="btn-deactivate" (click)="confirmDeactivateAccount()">
            <span class="deactivate-icon">👤-</span>
            <span class="deactivate-label">Deactivate Account</span>
          </button>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <!-- Top Navbar -->
        <header class="top-navbar">
          <div class="navbar-title">Subscription & Payments</div>
          <div class="navbar-actions">
            <span class="nav-link">Dashboard</span>
            <span class="nav-link">Reports</span>
            <span class="action-icon">🔔</span>
            <span class="action-icon">❔</span>
          </div>
        </header>

        <!-- Content Container -->
        <div class="content-container">
          <div class="page-header">
            <h1>Manage Subscription</h1>
            <p>View your current plan, upgrade options, and billing history.</p>
          </div>

          <!-- Loading state -->
          <div *ngIf="store.loading()" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading subscription details...</p>
          </div>

          <!-- Error state -->
          <div *ngIf="store.errorMessage()" class="error-state">
            <p-message severity="error" [text]="store.errorMessage()!"></p-message>
          </div>

          <!-- Current Subscription Status Banner -->
          <div *ngIf="store.mySubscription() as sub" class="current-status-box p-6 bg-white border border-gray-200 rounded-2xl shadow-sm mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div class="flex items-center gap-3 mb-2">
                <h3 class="text-xl font-bold text-gray-900">Estado de tu Suscripción</h3>
                <p-tag [value]="sub.status" [severity]="sub.status === 'ACTIVE' ? 'success' : 'danger'" styleClass="font-bold"></p-tag>
                <p-tag *ngIf="store.currentPlan() as plan" [value]="plan.name" [severity]="plan.name === 'PREMIUM' ? 'warn' : 'info'" styleClass="font-bold"></p-tag>
              </div>
              <p class="text-sm text-gray-600">Inicio de periodo: {{ sub.startDate }}</p>
            </div>

            <!-- Progress Bar for Basic Plan Requests -->
            <div *ngIf="store.currentPlan() as plan" class="w-full md:w-80">
              <div *ngIf="plan.maxRequestsPerMonth !== -1">
                <div class="flex justify-between items-center text-sm font-semibold text-gray-700 mb-2">
                  <span>Consumo de solicitudes</span>
                  <span>{{ store.monthlyRequestCount() }} / {{ plan.maxRequestsPerMonth }}</span>
                </div>
                <p-progressbar [value]="(store.monthlyRequestCount() / plan.maxRequestsPerMonth) * 100" [showValue]="false" [style]="{ height: '10px' }"></p-progressbar>
              </div>
              <div *ngIf="plan.maxRequestsPerMonth === -1" class="p-3 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-2">
                <i class="pi pi-bolt text-yellow-600 font-bold"></i>
                <span class="text-sm font-semibold text-yellow-800">Solicitudes y proyectos ilimitados</span>
              </div>
            </div>

            <div>
              <p-button *ngIf="sub.status === 'ACTIVE'" label="Cancelar suscripción" severity="danger" styleClass="p-button-outlined" (onClick)="confirmCancelSubscription()"></p-button>
            </div>
          </div>

          <!-- Plans Section -->
          <div class="plans-section" *ngIf="!store.loading()">
            <div class="plans-grid flex flex-col lg:flex-row gap-6 w-full">
              <!-- Basic Plan Card -->
              <p-card [styleClass]="isCurrentPlan(1) ? 'plan-card flex-1 current-selection' : 'plan-card flex-1'">
                <ng-template pTemplate="content">
                  <div class="plan-header flex justify-between items-start mb-4">
                    <div>
                      <span class="plan-subtitle">Basic Plan</span>
                      <h2 class="plan-title">Free</h2>
                    </div>
                    <p-tag *ngIf="isCurrentPlan(1)" value="CURRENT PLAN" severity="info" styleClass="font-bold tracking-wider"></p-tag>
                  </div>

                  <p class="plan-desc mb-6">Essential features for individuals and small operations.</p>

                  <ul class="feature-list flex flex-col gap-3 mb-8">
                    <li class="flex items-center gap-3">
                      <span class="check-icon pi pi-check"></span> 
                      <span>Up to 5 Projects</span>
                    </li>
                    <li class="flex items-center gap-3">
                      <span class="check-icon pi pi-check"></span> 
                      <span>Basic Asset Tracking</span>
                    </li>
                    <li class="flex items-center gap-3">
                      <span class="check-icon pi pi-check"></span> 
                      <span>Standard Support</span>
                    </li>
                  </ul>

                  <div class="mt-auto pt-4">
                    <p-button *ngIf="isCurrentPlan(1)" label="Current Selection" [disabled]="true" styleClass="w-full"></p-button>
                    <p-button *ngIf="!isCurrentPlan(1)" label="DOWNGRADE" severity="secondary" styleClass="w-full p-button-outlined" (onClick)="selectPlan(1)"></p-button>
                  </div>
                </ng-template>
              </p-card>

              <!-- Premium Plan Card -->
              <p-card [styleClass]="isCurrentPlan(2) ? 'plan-card flex-1 premium-card current-premium' : 'plan-card flex-1 premium-card'">
                <ng-template pTemplate="content">
                  <div class="plan-header flex justify-between items-start mb-4">
                    <div>
                      <span class="plan-subtitle text-yellow-600 font-bold">Premium Plan</span>
                      <h2 class="plan-title text-gray-900 font-extrabold">$40 <span class="period">/ month</span></h2>
                    </div>
                    <p-tag *ngIf="isCurrentPlan(2)" value="CURRENT PLAN" severity="warn" styleClass="font-bold tracking-wider"></p-tag>
                  </div>

                  <p class="plan-desc mb-6">Advanced tools for professional asset management teams.</p>

                  <ul class="feature-list flex flex-col gap-3 mb-8">
                    <li class="flex items-center gap-3">
                      <span class="check-icon pi pi-check"></span> 
                      <span>Unlimited Projects</span>
                    </li>
                    <li class="flex items-center gap-3">
                      <span class="check-icon pi pi-check"></span> 
                      <span>Advanced Analytics & Reporting</span>
                    </li>
                    <li class="flex items-center gap-3">
                      <span class="check-icon pi pi-check"></span> 
                      <span>24/7 Priority Support</span>
                    </li>
                    <li class="flex items-center gap-3">
                      <span class="check-icon pi pi-check"></span> 
                      <span>Custom API Integrations</span>
                    </li>
                  </ul>

                  <div class="mt-auto pt-4">
                    <p-button *ngIf="isCurrentPlan(2)" label="ACTIVE PREMIUM" styleClass="w-full bg-yellow-500 text-gray-900 border-none font-bold" [disabled]="true"></p-button>
                    <p-button *ngIf="!isCurrentPlan(2)" label="Upgrade to Premium" styleClass="w-full bg-yellow-500 text-gray-900 border-none font-bold hover:bg-yellow-400 shadow-md" (onClick)="selectPlan(2)"></p-button>
                  </div>
                </ng-template>
              </p-card>
            </div>

            <!-- Payment Sidebar -->
            <div class="payment-sidebar w-full lg:w-80 mt-6 lg:mt-0" *ngIf="isCurrentPlan(2)">
              <div class="payment-card bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-4">
                <h3 class="payment-title text-lg font-bold text-gray-900 mb-4">Payment Method</h3>
                <div class="card-details flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl mb-6">
                  <div class="visa-badge bg-blue-900 text-white font-extrabold text-xs px-3 py-1 rounded">VISA</div>
                  <div class="card-info">
                    <div class="card-num font-semibold text-sm text-gray-900">Visa ending in 4242</div>
                    <div class="card-exp text-xs text-gray-500">Expires 12/2026</div>
                  </div>
                </div>
                <p-button label="UPDATE METHOD" styleClass="w-full p-button-outlined"></p-button>
              </div>

              <div class="billing-info-box p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3">
                <span class="info-icon text-blue-600">ℹ️</span>
                <p class="text-sm text-blue-900 m-0 leading-normal">Your next billing date is <strong>October 15, 2026</strong>. You will be charged $40.00.</p>
              </div>
            </div>
          </div>

          <!-- Billing History Section -->
          <div class="billing-section mt-8" *ngIf="!store.loading()">
            <h3 class="text-xl font-bold text-gray-900 mb-4">Billing History</h3>
            <div class="table-container bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <table class="billing-table w-full border-collapse text-left">
                <thead>
                  <tr class="bg-gray-50 border-b border-gray-200">
                    <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">INVOICE DATE</th>
                    <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">PLAN</th>
                    <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">AMOUNT</th>
                    <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">STATUS</th>
                    <th class="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">RECEIPT</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of billingHistory" class="border-b border-gray-100 hover:bg-gray-50/50">
                    <td class="p-4 text-sm text-gray-800">{{ item.date }}</td>
                    <td class="p-4 text-sm text-gray-800">{{ item.plan }}</td>
                    <td class="p-4 text-sm text-gray-800">{{ item.amount }}</td>
                    <td class="p-4"><p-tag value="Paid" severity="success" styleClass="font-bold"></p-tag></td>
                    <td class="p-4"><a class="receipt-link text-blue-600 hover:underline font-medium text-sm" href="#">📄 PDF</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Footer -->
          <footer class="content-footer mt-12 py-6 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500 flex-wrap gap-4">
            <div class="footer-left">
              <span>© 2024 ElectroLink Asset Management. All rights reserved.</span>
            </div>
            <div class="footer-right flex gap-6">
              <a href="#" class="hover:text-gray-900">Privacy Policy</a>
              <a href="#" class="hover:text-gray-900">Terms of Service</a>
              <a href="#" class="hover:text-gray-900">ElectroLink</a>
            </div>
          </footer>
        </div>
      </main>

      <!-- Confirmation Dialogs -->
      <p-confirmDialog [style]="{ width: '90vw', maxWidth: '450px' }"></p-confirmDialog>
      <p-toast></p-toast>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #f8fafc;
      color: #1e293b;
    }

    /* --- Sidebar --- */
    .sidebar {
      width: 260px;
      background-color: #1a2332;
      color: #f8fafc;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1.75rem 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .logo-icon {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #0284c7, #4f46e5);
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .logo-text {
      font-weight: 700;
      font-size: 1.2rem;
      letter-spacing: 0.02em;
    }

    .sidebar-nav {
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      flex: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.85rem 1.25rem;
      border-radius: 0.625rem;
      color: #94a3b8;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .nav-item:hover {
      color: #f8fafc;
      background-color: rgba(255, 255, 255, 0.05);
    }

    .nav-item.active {
      color: #f8fafc;
      background-color: rgba(255, 255, 255, 0.1);
      font-weight: 600;
    }

    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .btn-deactivate {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: none;
      border: none;
      color: #f87171;
      font-weight: 500;
      font-size: 0.9rem;
      cursor: pointer;
      padding: 0.5rem;
      transition: opacity 0.2s;
    }

    .btn-deactivate:hover {
      opacity: 0.8;
    }

    /* --- Main Content --- */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      background-color: #ffffff;
    }

    .top-navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.25rem 3rem;
      border-bottom: 1px solid #e2e8f0;
      background-color: #ffffff;
    }

    .navbar-title {
      font-weight: 600;
      font-size: 1.1rem;
      color: #334155;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .nav-link {
      font-size: 0.9rem;
      color: #64748b;
      cursor: pointer;
      font-weight: 500;
    }

    .nav-link:hover {
      color: #0f172a;
    }

    .action-icon {
      font-size: 1.1rem;
      cursor: pointer;
      color: #64748b;
    }

    /* --- Content Container --- */
    .content-container {
      padding: 3rem;
      max-width: 1280px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 2.5rem;
    }

    .page-header h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.5rem;
    }

    .page-header p {
      color: #64748b;
      font-size: 0.95rem;
      margin: 0;
    }

    /* --- Plans Section --- */
    .plans-section {
      display: flex;
      gap: 2rem;
      align-items: flex-start;
    }

    :host ::ng-deep .plan-card {
      background: #ffffff !important;
      border: 1px solid #cbd5e1;
      border-radius: 1.25rem !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;
      height: 100%;
    }

    :host ::ng-deep .plan-card .p-card-body {
      padding: 2.5rem;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    :host ::ng-deep .current-selection {
      border: 2px solid #0f9d9a !important;
      box-shadow: 0 10px 25px -5px rgba(15, 157, 154, 0.15);
    }

    :host ::ng-deep .premium-card {
      border: 2px solid #F59E0B !important;
      background: linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, rgba(255, 255, 255, 1) 100%) !important;
      box-shadow: 0 10px 30px -5px rgba(245, 158, 11, 0.15);
    }

    :host ::ng-deep .current-premium {
      border-width: 3px !important;
      box-shadow: 0 15px 35px -5px rgba(245, 158, 11, 0.25);
    }

    .plan-subtitle {
      font-size: 0.85rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .plan-desc {
      color: #475569;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .feature-list {
      list-style: none;
      padding: 0;
      font-size: 0.9rem;
      color: #334155;
    }

    .check-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      background-color: #ecfdf5;
      color: #10b981;
      border-radius: 50%;
      font-size: 0.8rem;
      font-weight: 700;
    }

    /* --- Loading / Error --- */
    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      text-align: center;
    }

    .loading-spinner {
      width: 2.5rem;
      height: 2.5rem;
      border: 3px solid #e2e8f0;
      border-top-color: #0f9d9a;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ManageSubscriptionComponent implements OnInit {
  store = inject(SubscriptionStore);
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  billingHistory = [
    { date: 'Sep 15, 2026', plan: 'Premium', amount: '$40.00' },
    { date: 'Aug 15, 2026', plan: 'Premium', amount: '$40.00' },
    { date: 'Jul 15, 2026', plan: 'Premium', amount: '$40.00' },
    { date: 'Jun 15, 2026', plan: 'Basic', amount: '$0.00' }
  ];

  ngOnInit(): void {
    this.store.loadPlans().subscribe();
    this.store.loadMySubscription().subscribe();
  }

  isCurrentPlan(planId: number): boolean {
    const sub = this.store.mySubscription();
    return !!sub && sub.status === 'ACTIVE' && sub.planId === planId;
  }

  selectPlan(planId: number): void {
    this.store.upgradeSubscription(planId).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Plan Actualizado', detail: 'Tu plan se ha actualizado correctamente.' });
      }
    });
  }

  confirmCancelSubscription(): void {
    this.confirmationService.confirm({
      header: 'Cancelar Suscripción',
      message: '¿Estás seguro de que deseas cancelar tu suscripción actual? Perderás acceso a los beneficios exclusivos.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, cancelar',
      rejectLabel: 'No, mantener',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.store.cancelSubscription().subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Suscripción Cancelada', detail: 'Tu suscripción ha sido cancelada correctamente.' });
          }
        });
      }
    });
  }

  confirmDeactivateAccount(): void {
    this.confirmationService.confirm({
      header: 'Desactivar Cuenta',
      message: '¿Estás seguro de que deseas desactivar tu cuenta y cancelar la suscripción de forma permanente?',
      icon: 'pi pi-exclamation-circle',
      acceptLabel: 'Sí, desactivar',
      rejectLabel: 'No, regresar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.store.cancelSubscription().subscribe({
          next: () => {
            this.messageService.add({ severity: 'info', summary: 'Cuenta Desactivada', detail: 'Tu cuenta y suscripción han sido desactivadas.' });
          }
        });
      }
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}
