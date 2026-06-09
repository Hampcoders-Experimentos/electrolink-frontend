import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SubscriptionStore } from '@subscription/application/subscription-store.service';
import { IconComponent } from '@shared/presentation/components/icon/icon';

/**
 * Subscription plan descriptor consumed by {@link PlanListComponent}.
 *
 * @property id          - Plan identifier expected by the back end.
 * @property name        - Display name (`BASIC` / `PREMIUM`).
 * @property description - Short marketing blurb shown under the price.
 * @property price       - Monthly price in the local currency.
 */
interface Plan { id: number; name: string; description: string; price: number }

/**
 * Public plan-selection page.
 *
 * Renders the catalogue of subscription plans for unauthenticated and
 * trial users; opens an upgrade-confirmation modal when the user picks
 * `PREMIUM`.
 *
 * ### State signals
 * - {@link displayUpgradeDialog} - Drives the premium-upgrade modal.
 * - {@link plans}                - Mirror of `SubscriptionStore.plans`.
 *
 * ### External dependencies
 * - {@link SubscriptionStore} — `loadPlans`, `createSubscription`,
 *   `upgradeToPremium`, plus the read-only `plans()`, `loading()`,
 *   `errorMessage()` signals.
 *
 * ### Lifecycle
 * - `ngOnInit` triggers the plan catalogue fetch.
 */
@Component({
  selector: 'app-plan-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './plan-list.html',
  styleUrl: './plan-list.css',
})
export class PlanListComponent implements OnInit {
  store = inject(SubscriptionStore);
  private router = inject(Router);

  displayUpgradeDialog = signal<boolean>(false);
  plans = this.store.plans;

  ngOnInit(): void {
    this.store.loadPlans().subscribe();
  }

  onSelectPlan(plan: Plan): void {
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
        this.router.navigate(['/subscription/manage']).then();
      }
    });
  }
}
