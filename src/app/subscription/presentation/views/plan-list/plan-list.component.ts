import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscriptionStore } from '../../../application/subscription-store.service';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-plan-list',
  standalone: true,
  imports: [
    CommonModule, CardModule, TagModule, ButtonModule, DialogModule, MessageModule
  ],
  template: `
    <div class="pricing-container">
      <div class="pricing-wrapper">
        <header class="pricing-header">
          <h1>Choose Your Plan</h1>
          <p>Simple, transparent pricing for asset management teams of all sizes.</p>
        </header>

        <!-- Loading state -->
        <div *ngIf="store.loading()" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading plans...</p>
        </div>

        <!-- Error state -->
        <div *ngIf="store.errorMessage()" class="error-state">
          <p-message severity="error" [text]="store.errorMessage()!"></p-message>
        </div>

        <!-- Plans Grid -->
        <div class="plans-grid" *ngIf="!store.loading()">
          <p-card *ngFor="let plan of store.plans()" [styleClass]="plan.name === 'PREMIUM' ? 'plan-card premium-card' : 'plan-card'">
            <ng-template pTemplate="content">
              <div class="plan-header flex justify-between items-start mb-4">
                <div>
                  <span class="plan-subtitle">{{ plan.name }} PLAN</span>
                  <h2 class="plan-title">
                    {{ plan.price === 0 ? 'Free' : '$' + plan.price }} 
                    <span class="period" *ngIf="plan.price > 0">/ month</span>
                  </h2>
                </div>
                <p-tag *ngIf="plan.name === 'PREMIUM'" value="PREMIUM" severity="warn" styleClass="font-bold tracking-wider"></p-tag>
              </div>

              <p class="plan-desc mb-6">{{ plan.description }}</p>

              <ul class="feature-list mb-8 flex flex-col gap-4">
                <li class="flex items-center gap-3">
                  <span class="check-icon pi pi-check"></span> 
                  <span>{{ plan.price === 0 ? 'Up to 5 Projects' : 'Unlimited Projects' }}</span>
                </li>
                <li class="flex items-center gap-3">
                  <span class="check-icon pi pi-check"></span> 
                  <span>{{ plan.price === 0 ? 'Basic Asset Tracking' : 'Advanced Analytics & Reporting' }}</span>
                </li>
                <li class="flex items-center gap-3">
                  <span class="check-icon pi pi-check"></span> 
                  <span>{{ plan.price === 0 ? 'Standard Support' : '24/7 Priority Support' }}</span>
                </li>
                <li *ngIf="plan.price > 0" class="flex items-center gap-3">
                  <span class="check-icon pi pi-check"></span> 
                  <span>Custom API Integrations</span>
                </li>
              </ul>

              <div class="mt-auto pt-4">
                <p-button 
                  [label]="plan.price === 0 ? 'Get Started' : 'Subscribe Now'" 
                  [styleClass]="plan.name === 'PREMIUM' ? 'w-full bg-yellow-500 border-none font-bold text-gray-900 hover:bg-yellow-400' : 'w-full bg-[var(--el-primary)] border-none font-bold'"
                  (onClick)="onSelectPlan(plan)">
                </p-button>
              </div>
            </ng-template>
          </p-card>
        </div>
      </div>

      <!-- Upgrade Confirmation Dialog -->
      <p-dialog [(visible)]="displayUpgradeDialog" header="Upgrade to Premium" [modal]="true" [style]="{ width: '90vw', maxWidth: '450px' }">
        <div class="flex flex-col gap-4 py-4 text-gray-800">
          <p class="text-base leading-normal">Desbloquea solicitudes ilimitadas y herramientas avanzadas para tu gestión de activos.</p>
          
          <div class="p-6 rounded-2xl text-white text-center shadow-lg" style="background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid #F59E0B;">
            <p class="text-4xl font-extrabold text-yellow-500">$40</p>
            <p class="text-sm text-gray-300 mt-1">/ mes — Plan Premium</p>
          </div>

          <div class="mt-2">
            <h4 class="font-bold text-sm text-gray-700 uppercase tracking-wider mb-3">Beneficios Exclusivos:</h4>
            <ul class="flex flex-col gap-3 text-sm text-gray-700">
              <li class="flex items-center gap-3">
                <i class="pi pi-check text-green-500 font-bold"></i> 
                <span>Proyectos y solicitudes ilimitadas</span>
              </li>
              <li class="flex items-center gap-3">
                <i class="pi pi-check text-green-500 font-bold"></i> 
                <span>Soporte prioritario 24/7</span>
              </li>
              <li class="flex items-center gap-3">
                <i class="pi pi-check text-green-500 font-bold"></i> 
                <span>Reportes avanzados y analítica</span>
              </li>
              <li class="flex items-center gap-3">
                <i class="pi pi-check text-green-500 font-bold"></i> 
                <span>Integraciones API a medida</span>
              </li>
            </ul>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <div class="flex justify-end gap-3 w-full">
            <p-button label="Cancelar" severity="secondary" styleClass="p-button-text" (onClick)="displayUpgradeDialog.set(false)"></p-button>
            <p-button label="Upgrade to Premium" icon="pi pi-crown" styleClass="bg-yellow-500 text-gray-900 border-none font-bold hover:bg-yellow-400" (onClick)="confirmUpgrade()"></p-button>
          </div>
        </ng-template>
      </p-dialog>
    </div>
  `,
  styles: [`
    .pricing-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 5rem 2rem;
      color: #f8fafc;
    }

    .pricing-wrapper {
      max-width: 1000px;
      margin: 0 auto;
    }

    .pricing-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .pricing-header h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0 0 1rem;
      background: linear-gradient(to right, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .pricing-header p {
      color: #94a3b8;
      font-size: 1.1rem;
      margin: 0;
    }

    .plans-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
    }

    :host ::ng-deep .plan-card {
      background: rgba(255, 255, 255, 0.04) !important;
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 1.25rem !important;
      transition: all 0.3s ease;
      color: #f8fafc;
      height: 100%;
    }

    :host ::ng-deep .plan-card .p-card-body {
      padding: 2.5rem;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    :host ::ng-deep .plan-card:hover {
      border-color: rgba(56, 189, 248, 0.3);
      transform: translateY(-4px);
      box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
    }

    :host ::ng-deep .premium-card {
      border: 2px solid #F59E0B !important;
      background: linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%) !important;
      box-shadow: 0 10px 30px -5px rgba(245, 158, 11, 0.2);
    }

    :host ::ng-deep .premium-card:hover {
      border-color: #F59E0B !important;
      box-shadow: 0 20px 40px -5px rgba(245, 158, 11, 0.3);
    }

    .plan-subtitle {
      font-size: 0.85rem;
      font-weight: 600;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .plan-title {
      font-size: 2.5rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0.25rem 0 0;
    }

    .period {
      font-size: 1rem;
      font-weight: 500;
      color: #94a3b8;
    }

    .plan-desc {
      color: #94a3b8;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .feature-list {
      list-style: none;
      padding: 0;
      color: #e2e8f0;
      font-size: 0.95rem;
    }

    .check-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      background: rgba(34, 197, 94, 0.15);
      color: #22c55e;
      border-radius: 50%;
      font-size: 0.75rem;
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
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class PlanListComponent implements OnInit {
  store = inject(SubscriptionStore);
  private router = inject(Router);

  displayUpgradeDialog = signal<boolean>(false);

  ngOnInit(): void {
    this.store.loadPlans().subscribe();
  }

  onSelectPlan(plan: any): void {
    if (plan.name === 'PREMIUM') {
      this.displayUpgradeDialog.set(true);
    } else {
      this.store.createSubscription(plan.id).subscribe({
        next: () => this.router.navigate(['/subscription/manage'])
      });
    }
  }

  confirmUpgrade(): void {
    this.store.upgradeToPremium().subscribe({
      next: () => {
        this.displayUpgradeDialog.set(false);
        this.router.navigate(['/subscription/manage']);
      }
    });
  }
}
