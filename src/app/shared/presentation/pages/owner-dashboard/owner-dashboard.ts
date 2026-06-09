import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '../../components/icon/icon';

interface KpiCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
  tone: 'blue' | 'amber' | 'emerald' | 'rose' | 'violet';
}

interface ServiceItem {
  id: number;
  technician: string;
  service: string;
  date: string;
  status: 'Completado' | 'Programado' | 'En Proceso';
}

const TONE: Record<KpiCard['tone'], string> = {
  blue:    'bg-blue-50 text-blue-600',
  amber:   'bg-amber-50 text-amber-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  rose:    'bg-rose-50 text-rose-600',
  violet:  'bg-violet-50 text-violet-600',
};

const STATUS_BADGE: Record<ServiceItem['status'], string> = {
  'Completado': 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  'Programado': 'bg-sky-100 text-sky-700 ring-sky-200',
  'En Proceso': 'bg-amber-100 text-amber-700 ring-amber-200',
};

@Component({
  selector: 'el-owner-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './owner-dashboard.html',
  styleUrl: './owner-dashboard.css',
})
export class OwnerDashboardComponent {
  private router = inject(Router);

  kpis: KpiCard[] = [
    { label: 'Propiedades',       value: '3',           change: '1 en mantenimiento',         positive: false, icon: 'building',     tone: 'blue'    },
    { label: 'Servicios Activos', value: '4',           change: '2 esta semana',              positive: true,  icon: 'wrench',       tone: 'amber'   },
    { label: 'Completados',       value: '12',          change: '100% satisfacción',          positive: true,  icon: 'check-circle', tone: 'emerald' },
    { label: 'Gastos del Mes',    value: '$1,250',      change: '15% menos que el mes pasado', positive: true,  icon: 'dollar',      tone: 'rose'    },
    { label: 'Próximo Servicio',  value: 'Mañana 10am', change: 'Mantenimiento Programado',   positive: true,  icon: 'clock',        tone: 'violet'  },
  ];

  recentServices: ServiceItem[] = [
    { id: 1, technician: 'Carlos Martínez', service: 'Reparación Eléctrica',     date: 'Hoy, 4:00 PM',      status: 'En Proceso' },
    { id: 2, technician: 'Ana López',       service: 'Instalación Panel Solar', date: 'Mañana, 9:00 AM',  status: 'Programado' },
    { id: 3, technician: 'Roberto Díaz',    service: 'Mantenimiento General',   date: '12 May, 2:00 PM',   status: 'Completado' },
    { id: 4, technician: 'María García',    service: 'Domótica Smart Home',     date: '14 May, 10:00 AM',  status: 'Completado' },
  ];

  quickActions = [
    { label: 'Mis Propiedades', icon: 'building',    path: '/owner/properties' },
    { label: 'Nuevo Servicio',  icon: 'plus-circle', path: '/owner/new-request' },
    { label: 'Ver Analytics',   icon: 'chart-bar',   path: '/owner/analytics' },
  ];

  protected toneClass(t: KpiCard['tone']) { return TONE[t]; }
  protected statusBadge(s: ServiceItem['status']) { return STATUS_BADGE[s]; }

  navigate(path: string) { this.router.navigate([path]); }
}
