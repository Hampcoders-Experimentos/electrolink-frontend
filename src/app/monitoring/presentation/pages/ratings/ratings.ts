import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MonitoringStore } from '../../../application/monitoring-store.service';
import { IconComponent } from '../../../../shared/presentation/components/icon/icon';

const SCORE_BADGE: Record<'high' | 'mid' | 'low', string> = {
  high: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  mid:  'bg-amber-100 text-amber-700 ring-amber-200',
  low:  'bg-rose-100 text-rose-700 ring-rose-200',
};

@Component({
  selector: 'el-ratings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, IconComponent],
  templateUrl: './ratings.html',
  styleUrl: './ratings.css',
})
export class RatingsComponent implements OnInit {
  store = inject(MonitoringStore);

  ngOnInit(): void {
    this.store.loadRatings('tech-1').subscribe();
  }

  getInitials(raterId: string): string {
    return raterId ? raterId.substring(0, 2).toUpperCase() : 'US';
  }

  getRaterDisplayName(raterId: string): string {
    return raterId === 'tech-1' ? 'Técnico Asignado' : 'Cliente ElectroLink';
  }

  scoreBadge(score: number): string {
    if (score >= 4) return SCORE_BADGE.high;
    if (score === 3) return SCORE_BADGE.mid;
    return SCORE_BADGE.low;
  }
}
