import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent, IconName } from '../../components/icon/icon';

/** Allowed accent palettes for KPI cards. */
type KpiTone = 'blue' | 'amber' | 'rose' | 'emerald' | 'violet';

/** Allowed status states surfaced in the upcoming-jobs badge column. */
type JobStatus = 'Confirmado' | 'Pendiente' | 'En Proceso';

/**
 * KPI card descriptor with a pre-resolved tone class to avoid per-CD lookups.
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

/** Upcoming job row with a pre-resolved badge class for the status column. */
interface JobItem {
  readonly id: number;
  readonly client: string;
  readonly service: string;
  readonly date: string;
  readonly status: JobStatus;
  readonly badgeClass: string;
}

/** Tone palette ↔ Tailwind classes lookup. */
const TONE: Readonly<Record<KpiTone, string>> = {
  blue:    'bg-blue-50 text-blue-600',
  amber:   'bg-amber-50 text-amber-600',
  rose:    'bg-rose-50 text-rose-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet:  'bg-violet-50 text-violet-600',
};

/** Status state ↔ Tailwind badge classes lookup. */
const STATUS_BADGE: Readonly<Record<JobStatus, string>> = {
  'Confirmado': 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  'Pendiente':  'bg-amber-100 text-amber-700 ring-amber-200',
  'En Proceso': 'bg-sky-100 text-sky-700 ring-sky-200',
};

/**
 * Technician dashboard page.
 *
 * Visual specification: Figma frame `106:9232` (Technician / Dashboard).
 *
 * ### Performance notes
 * Mirrors the Owner dashboard pattern — KPI / status class strings are
 * pre-resolved at construction so the template performs Signal-free property
 * reads only, keeping change-detection cost minimal under the zoneless runtime.
 */
@Component({
  selector: 'el-technician-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './technician-dashboard.html',
  styleUrl: './technician-dashboard.css',
})
export class TechnicianDashboardComponent {
  private readonly router = inject(Router);

  /** KPI cards rendered in the top grid. */
  readonly kpis: ReadonlyArray<KpiCard> = [
    { label: 'Servicios Totales', value: '48',      change: '+12% este mes',         positive: true,  icon: 'home',   tone: 'blue',    toneClass: TONE.blue    },
    { label: 'Trabajos Activos',  value: '6',       change: '2 urgentes',            positive: false, icon: 'box',    tone: 'amber',   toneClass: TONE.amber   },
    { label: 'Calificación',      value: '4.8',     change: 'Excelente',             positive: true,  icon: 'star',   tone: 'rose',    toneClass: TONE.rose    },
    { label: 'Ganancias del Mes', value: '$3,450',  change: '+8% vs mes anterior',   positive: true,  icon: 'dollar', tone: 'emerald', toneClass: TONE.emerald },
    { label: 'Próxima Cita',      value: 'Hoy 4pm', change: 'Martínez - Reparación', positive: true,  icon: 'clock',  tone: 'violet',  toneClass: TONE.violet  },
  ];

  /** Rows rendered inside the upcoming-services table. */
  readonly upcomingJobs: ReadonlyArray<JobItem> = [
    { id: 1, client: 'Carlos Martínez', service: 'Reparación Eléctrica',     date: 'Hoy, 4:00 PM',     status: 'Confirmado', badgeClass: STATUS_BADGE['Confirmado'] },
    { id: 2, client: 'Ana López',       service: 'Instalación Panel Solar', date: 'Mañana, 9:00 AM',  status: 'Pendiente',  badgeClass: STATUS_BADGE['Pendiente']  },
    { id: 3, client: 'Roberto Díaz',    service: 'Mantenimiento General',   date: '12 May, 2:00 PM',  status: 'Confirmado', badgeClass: STATUS_BADGE['Confirmado'] },
    { id: 4, client: 'María García',    service: 'Domótica Smart Home',     date: '14 May, 10:00 AM', status: 'En Proceso', badgeClass: STATUS_BADGE['En Proceso'] },
  ];

  /** Quick-action shortcuts displayed in the side widget. */
  readonly quickActions: ReadonlyArray<{ label: string; icon: IconName; path: string }> = [
    { label: 'Gestionar Inventario', icon: 'box',        path: '/technician/inventory' },
    { label: 'Mi Perfil',            icon: 'user',       path: '/technician/profile'   },
    { label: 'Ver Analytics',        icon: 'chart-line', path: '/technician/analytics' },
  ];

  /**
   * Navigates to the supplied absolute path.
   *
   * @param path - Router target.
   */
  navigate(path: string): void {
    this.router.navigate([path]);
  }
}
