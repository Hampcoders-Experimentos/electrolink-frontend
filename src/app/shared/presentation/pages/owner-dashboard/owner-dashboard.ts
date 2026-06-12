import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent, IconName } from '../../components/icon/icon';

/** Allowed accent palettes for KPI cards. Each maps to a Tailwind class pair. */
type KpiTone = 'blue' | 'amber' | 'emerald' | 'rose' | 'violet';

/** Allowed status states surfaced in the recent-services badge column. */
type ServiceStatus = 'Completado' | 'Programado' | 'En Proceso';

/**
 * KPI card descriptor consumed by the dashboard grid.
 *
 * `toneClass` is pre-resolved at construction time so the template can render
 * it via a Signal-free property access — no method call per change-detection
 * pass and no allocation churn.
 */
interface KpiCard {
  readonly label: string;
  readonly value: string;
  readonly change: string;
  readonly positive: boolean;
  readonly icon: IconName;
  readonly tone: KpiTone;
  readonly toneClass: string;
}

/** Recent service row with a pre-resolved badge class for the status column. */
interface ServiceItem {
  readonly id: number;
  readonly technician: string;
  readonly service: string;
  readonly date: string;
  readonly status: ServiceStatus;
  readonly badgeClass: string;
}

/** Tone palette ↔ Tailwind classes lookup. */
const TONE: Readonly<Record<KpiTone, string>> = {
  blue:    'bg-blue-50 text-blue-600',
  amber:   'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  rose:    'bg-rose-50 text-rose-600',
  violet:  'bg-violet-50 text-violet-600',
};

/** Status state ↔ Tailwind badge classes lookup. */
const STATUS_BADGE: Readonly<Record<ServiceStatus, string>> = {
  'Completado': 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  'Programado': 'bg-sky-100 text-sky-700 ring-sky-200',
  'En Proceso': 'bg-amber-100 text-amber-700 ring-amber-200',
};

/**
 * Owner dashboard page.
 *
 * Visual specification: Figma frame `106:8600` (Owner / Dashboard).
 *
 * ### Responsibilities
 * - Renders the KPI summary grid, the recent-services table and the
 *   quick-actions side widget.
 *
 * ### Performance notes
 * - All static data (KPIs, recent services, quick actions) is materialized
 *   eagerly with **pre-resolved Tailwind class strings**. The template only
 *   reads properties, eliminating per-CD method calls (`toneClass()`,
 *   `statusBadge()`) and keeping the page zoneless-friendly.
 * - Templates use native control flow (`@for` with `track`) so Angular can
 *   reuse DOM nodes when the list reference is replaced.
 */
@Component({
  selector: 'el-owner-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './owner-dashboard.html',
  styleUrl: './owner-dashboard.css',
})
export class OwnerDashboardComponent {
  private readonly router = inject(Router);

  /** KPI cards rendered in the top grid. */
  readonly kpis: ReadonlyArray<KpiCard> = [
    { label: 'Propiedades',       value: '3',           change: '1 en mantenimiento',          positive: false, icon: 'building',     tone: 'blue',    toneClass: TONE.blue    },
    { label: 'Servicios Activos', value: '4',           change: '2 esta semana',               positive: true,  icon: 'wrench',       tone: 'amber',   toneClass: TONE.amber   },
    { label: 'Completados',       value: '12',          change: '100% satisfacción',           positive: true,  icon: 'check-circle', tone: 'emerald', toneClass: TONE.emerald },
    { label: 'Gastos del Mes',    value: '$1,250',      change: '15% menos que el mes pasado', positive: true,  icon: 'dollar',       tone: 'rose',    toneClass: TONE.rose    },
    { label: 'Próximo Servicio',  value: 'Mañana 10am', change: 'Mantenimiento Programado',    positive: true,  icon: 'clock',        tone: 'violet',  toneClass: TONE.violet  },
  ];

  /** Rows rendered inside the recent services table. */
  readonly recentServices: ReadonlyArray<ServiceItem> = [
    { id: 1, technician: 'Carlos Martínez', service: 'Reparación Eléctrica',     date: 'Hoy, 4:00 PM',     status: 'En Proceso', badgeClass: STATUS_BADGE['En Proceso'] },
    { id: 2, technician: 'Ana López',       service: 'Instalación Panel Solar', date: 'Mañana, 9:00 AM',  status: 'Programado', badgeClass: STATUS_BADGE['Programado'] },
    { id: 3, technician: 'Roberto Díaz',    service: 'Mantenimiento General',   date: '12 May, 2:00 PM',  status: 'Completado', badgeClass: STATUS_BADGE['Completado'] },
    { id: 4, technician: 'María García',    service: 'Domótica Smart Home',     date: '14 May, 10:00 AM', status: 'Completado', badgeClass: STATUS_BADGE['Completado'] },
  ];

  /** Quick-action shortcuts displayed in the side widget. */
  readonly quickActions: ReadonlyArray<{ label: string; icon: IconName; path: string }> = [
    { label: 'Mis Propiedades', icon: 'building',    path: '/owner/properties'  },
    { label: 'Nuevo Servicio',  icon: 'plus-circle', path: '/owner/new-request' },
    { label: 'Ver Analytics',   icon: 'chart-bar',   path: '/owner/analytics'   },
  ];

  /**
   * Navigates to the supplied absolute path.
   *
   * @param path - Router target.
   */
  navigate(path: string): void {
    this.router.navigate([path]).then();
  }
}
