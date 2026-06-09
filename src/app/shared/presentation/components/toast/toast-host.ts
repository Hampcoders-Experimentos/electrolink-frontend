import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationsService, ToastSeverity } from '../../../application/notifications.service';
import { IconComponent } from '../icon/icon';

const SEVERITY_STYLES: Record<ToastSeverity, { bg: string; ring: string; icon: string; iconName: string }> = {
  success: { bg: 'bg-emerald-50',  ring: 'ring-emerald-200', icon: 'text-emerald-600', iconName: 'check-circle' },
  info:    { bg: 'bg-sky-50',      ring: 'ring-sky-200',     icon: 'text-sky-600',     iconName: 'info-circle' },
  warn:    { bg: 'bg-amber-50',    ring: 'ring-amber-200',   icon: 'text-amber-600',   iconName: 'exclamation-triangle' },
  error:   { bg: 'bg-rose-50',     ring: 'ring-rose-200',    icon: 'text-rose-600',    iconName: 'exclamation-circle' },
};

@Component({
  selector: 'el-toast-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.css',
})
export class ToastHostComponent {
  private readonly notifications = inject(NotificationsService);
  protected readonly toasts = this.notifications.toasts;

  protected styleFor(severity: ToastSeverity) {
    return SEVERITY_STYLES[severity];
  }

  protected dismiss(id: number): void {
    this.notifications.dismiss(id);
  }
}
