import { computed, inject, Injectable, signal } from '@angular/core';
import { Plan } from '../domain/model/plan.entity';
import { Subscription } from '../domain/model/subscription.entity';
import { SubscriptionApiService } from '../infrastructure/subscription-api.service';
import { IamStore } from '../../iam/application/iam-store.service';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SubscriptionStore {
  private subscriptionApi = inject(SubscriptionApiService);
  private iamStore = inject(IamStore);

  // --- Signals ---
  private readonly plansSignal = signal<Plan[]>([]);
  private readonly mySubscriptionSignal = signal<Subscription | null>(null);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // --- Public Readonly Accessors ---
  readonly plans = this.plansSignal.asReadonly();
  readonly mySubscription = this.mySubscriptionSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly errorMessage = this.errorSignal.asReadonly();

  // --- Computed ---
  readonly currentPlan = computed(() => {
    const sub = this.mySubscriptionSignal();
    if (!sub || sub.status !== 'ACTIVE') return null;
    return this.plansSignal().find(p => p.id === sub.planId) || null;
  });

  readonly monthlyRequestCount = computed(() => {
    const sub = this.mySubscriptionSignal();
    return sub ? sub.monthlyRequestCount : 0;
  });

  readonly hasReachedLimit = computed(() => {
    const sub = this.mySubscriptionSignal();
    const plan = this.currentPlan();
    if (!sub || !plan) return false;
    if (plan.maxRequestsPerMonth === -1) return false;
    return sub.monthlyRequestCount >= plan.maxRequestsPerMonth;
  });

  /**
   * Helper to get current user ID with fallback for local dev
   */
  private getUserId(): string {
    const user = this.iamStore.currentUser();
    return user ? user.id.toString() : '1';
  }

  loadPlans(): Observable<Plan[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.subscriptionApi.getPlans().pipe(
      tap({
        next: plans => {
          this.plansSignal.set(plans);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al cargar los planes de suscripción.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  loadMySubscription(): Observable<Subscription[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    const userId = this.getUserId();

    return this.subscriptionApi.getSubscriptionsByUserId(userId).pipe(
      tap({
        next: subscriptions => {
          const active = subscriptions.find(s => s.status === 'ACTIVE') || subscriptions[0] || null;
          this.mySubscriptionSignal.set(active);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al cargar la suscripción del usuario.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  createSubscription(planId: number): Observable<Subscription> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    const userId = this.getUserId();

    const newSub = {
      userId,
      planId,
      status: 'ACTIVE' as const,
      startDate: new Date().toISOString().split('T')[0],
      monthlyRequestCount: 0
    };

    return this.subscriptionApi.createSubscription(newSub).pipe(
      tap({
        next: subscription => {
          this.mySubscriptionSignal.set(subscription);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al crear la suscripción.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  upgradeSubscription(newPlanId: number): Observable<Subscription> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    const currentSub = this.mySubscriptionSignal();

    if (!currentSub) {
      return this.createSubscription(newPlanId);
    }

    const updatedSub = {
      id: currentSub.id,
      userId: currentSub.userId,
      planId: newPlanId,
      status: 'ACTIVE' as const,
      startDate: currentSub.startDate,
      monthlyRequestCount: currentSub.monthlyRequestCount
    };

    return this.subscriptionApi.updateSubscription(updatedSub, currentSub.id).pipe(
      tap({
        next: subscription => {
          this.mySubscriptionSignal.set(subscription);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al actualizar la suscripción.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  cancelSubscription(): Observable<Subscription | void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    const currentSub = this.mySubscriptionSignal();

    if (!currentSub) {
      this.loadingSignal.set(false);
      return new Observable<void>(sub => sub.complete());
    }

    const cancelledSub = {
      id: currentSub.id,
      userId: currentSub.userId,
      planId: currentSub.planId,
      status: 'CANCELLED' as const,
      startDate: currentSub.startDate,
      monthlyRequestCount: currentSub.monthlyRequestCount
    };

    return this.subscriptionApi.updateSubscription(cancelledSub, currentSub.id).pipe(
      tap({
        next: subscription => {
          this.mySubscriptionSignal.set(subscription);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al cancelar la suscripción.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  incrementRequests(): Observable<Subscription | void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    const currentSub = this.mySubscriptionSignal();

    if (!currentSub) {
      this.loadingSignal.set(false);
      return new Observable<void>(sub => sub.complete());
    }

    const updatedSub = {
      id: currentSub.id,
      userId: currentSub.userId,
      planId: currentSub.planId,
      status: currentSub.status,
      startDate: currentSub.startDate,
      monthlyRequestCount: currentSub.monthlyRequestCount + 1
    };

    return this.subscriptionApi.updateSubscription(updatedSub, currentSub.id).pipe(
      tap({
        next: subscription => {
          this.mySubscriptionSignal.set(subscription);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al incrementar solicitudes.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  upgradePlan(newPlanId: number): Observable<Subscription> {
    return this.upgradeSubscription(newPlanId);
  }

  upgradeToPremium(): Observable<Subscription> {
    const premiumPlan = this.plansSignal().find(p => p.name === 'PREMIUM');
    const planId = premiumPlan ? premiumPlan.id : 2;
    return this.upgradeSubscription(planId);
  }

  canMakeRequest(): boolean {
    const sub = this.mySubscriptionSignal();
    const plan = this.currentPlan();
    if (!sub || !plan) return false;
    return sub.canMakeRequest(plan);
  }

  clearError(): void {
    this.errorSignal.set(null);
  }
}
