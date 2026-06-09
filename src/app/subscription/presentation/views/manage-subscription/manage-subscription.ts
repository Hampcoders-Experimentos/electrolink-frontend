import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { SubscriptionStore } from '../../../application/subscription-store.service';
import { Router } from '@angular/router';
import { NotificationsService } from '../../../../shared/application/notifications.service';
import { IconComponent } from '../../../../shared/presentation/components/icon/icon';

@Component({
  selector: 'app-manage-subscription',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './manage-subscription.html',
  styleUrl: './manage-subscription.css',
})
export class ManageSubscriptionComponent implements OnInit {
  store = inject(SubscriptionStore);
  private router = inject(Router);
  private notifications = inject(NotificationsService);

  billingHistory = [
    { date: 'Sep 15, 2026', plan: 'Premium', amount: '$40.00' },
    { date: 'Aug 15, 2026', plan: 'Premium', amount: '$40.00' },
    { date: 'Jul 15, 2026', plan: 'Premium', amount: '$40.00' },
    { date: 'Jun 15, 2026', plan: 'Basic',   amount: '$0.00' }
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
      next: () => this.notifications.showSuccess('Plan Actualizado', 'Tu plan se ha actualizado correctamente.')
    });
  }

  confirmCancelSubscription(): void {
    const ok = typeof window !== 'undefined'
      ? window.confirm('¿Cancelar suscripción? Perderás acceso a los beneficios exclusivos.')
      : true;
    if (!ok) return;
    this.store.cancelSubscription().subscribe({
      next: () => this.notifications.showSuccess('Suscripción Cancelada', 'Tu suscripción ha sido cancelada correctamente.')
    });
  }

  confirmDeactivateAccount(): void {
    const ok = typeof window !== 'undefined'
      ? window.confirm('¿Desactivar la cuenta y cancelar la suscripción de forma permanente?')
      : true;
    if (!ok) return;
    this.store.cancelSubscription().subscribe({
      next: () => this.notifications.showInfo('Cuenta Desactivada', 'Tu cuenta y suscripción han sido desactivadas.')
    });
  }

  navigate(path: string): void {
    this.router.navigate([path]);
  }
}
