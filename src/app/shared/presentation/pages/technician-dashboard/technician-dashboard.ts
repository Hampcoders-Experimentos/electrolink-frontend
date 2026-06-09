import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IconComponent } from '../../components/icon/icon';

interface KpiCard {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
  tone: 'blue' | 'amber' | 'rose' | 'emerald' | 'violet';
}

interface JobItem {
  id: number;
  client: string;
  service: string;
  date: string;
  status: 'Confirmado' | 'Pendiente' | 'En Proceso';
}

const TONE: Record<KpiCard['tone'], string> = {
  blue:    'bg-blue-50 text-blue-600',
  amber:   'bg-amber-50 text-amber-600',
  rose:    'bg-rose-50 text-rose-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  violet:  'bg-violet-50 text-violet-600',
};

const STATUS_BADGE: Record<JobItem['status'], string> = {
  'Confirmado': 'bg-emerald-100 text-emerald-700 ring-emerald-200',
  'Pendiente':  'bg-amber-100 text-amber-700 ring-amber-200',
  'En Proceso': 'bg-sky-100 text-sky-700 ring-sky-200',
};

@Component({
  selector: 'el-technician-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './technician-dashboard.html',
  styleUrl: './technician-dashboard.css',
})
export class TechnicianDashboardComponent {
  private router = inject(Router);

  kpis: KpiCard[] = [
    { label: 'Servicios Totales',  value: '48',        change: '+12% este mes',     positive: true,  icon: 'home',   tone: 'blue'    },
    { label: 'Trabajos Activos',   value: '6',         change: '2 urgentes',         positive: false, icon: 'box',    tone: 'amber'   },
    { label: 'Calificación',       value: '4.8',       change: 'Excelente',          positive: true,  icon: 'star',   tone: 'rose'    },
    { label: 'Ganancias del Mes',  value: '$3,450',    change: '+8% vs mes anterior', positive: true,  icon: 'dollar', tone: 'emerald' },
    { label: 'Próxima Cita',       value: 'Hoy 4pm',   change: 'Martínez - Reparación', positive: true, icon: 'clock', tone: 'violet'  },
  ];

  upcomingJobs: JobItem[] = [
    { id: 1, client: 'Carlos Martínez', service: 'Reparación Eléctrica',     date: 'Hoy, 4:00 PM',      status: 'Confirmado' },
    { id: 2, client: 'Ana López',       service: 'Instalación Panel Solar', date: 'Mañana, 9:00 AM',  status: 'Pendiente' },
    { id: 3, client: 'Roberto Díaz',    service: 'Mantenimiento General',   date: '12 May, 2:00 PM',   status: 'Confirmado' },
    { id: 4, client: 'María García',    service: 'Domótica Smart Home',     date: '14 May, 10:00 AM',  status: 'En Proceso' },
  ];

  quickActions = [
    { label: 'Gestionar Inventario', icon: 'box',        path: '/technician/inventory' },
    { label: 'Mi Perfil',            icon: 'user',       path: '/technician/profile' },
    { label: 'Ver Analytics',        icon: 'chart-line', path: '/technician/analytics' },
  ];

  protected toneClass(t: KpiCard['tone']) { return TONE[t]; }
  protected statusBadge(s: JobItem['status']) { return STATUS_BADGE[s]; }

  navigate(path: string) { this.router.navigate([path]); }
}
