import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SubscriptionStore } from '@subscription/application/subscription-store.service';
import { IconComponent } from '@shared/presentation/components/icon/icon';

interface Plan { id: number; name: string; description: string; price: number }

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
        this.router.navigate(['/subscription/manage']);
      }
    });
  }
}
