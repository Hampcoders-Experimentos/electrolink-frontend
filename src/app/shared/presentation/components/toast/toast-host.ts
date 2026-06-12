import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NotificationsService, ToastSeverity } from '@shared/application/notifications.service';
import { IconComponent, IconName } from '../icon/icon';

const SEVERITY_STYLES: Record<ToastSeverity, { bg: string; ring: string; icon: string; iconName: IconName }> = {
  success: { bg: 'bg-emerald-50',  ring: 'ring-emerald-200', icon: 'text-emerald-600', iconName: 'check-circle' },
  info:    { bg: 'bg-sky-50',      ring: 'ring-sky-200',     icon: 'text-sky-600',     iconName: 'info-circle' },
  warn:    { bg: 'bg-amber-50',    ring: 'ring-amber-200',   icon: 'text-amber-600',   iconName: 'exclamation-triangle' },
  error:   { bg: 'bg-rose-50',     ring: 'ring-rose-200',    icon: 'text-rose-600',    iconName: 'exclamation-circle' },
};

/**
 * Top-level toast/notification surface mounted near the app root.
 *
 * Subscribes to the {@link NotificationsService} `toasts` signal and renders
 * each entry as a stacked card in the top-right corner. The host is fully
 * stateless — all entries (and their lifecycle) live in the service.
 *
 * ### State signals
 * - {@link toasts} — Signal-backed list of active toasts proxied from the
 *   service so the template can read them directly with zero glue code.
 *
 * ### External dependencies
 * - {@link NotificationsService} — single source of truth for both the
 *   visible toast list and the dismiss action invoked from the close button.
 *
 * ### Performance
 * - `OnPush` change detection; the template only re-renders when the
 *   `toasts` signal changes.
 * - {@link styleFor} is a pure lookup against a frozen constant — safe to
 *   call from the template without allocating new objects on each pass.
 */
@Component({
  selector: 'el-toast-host',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.css',
})
export class ToastHostComponent {
  /** Service owning the toast list and the `dismiss` action. */
  private readonly notifications = inject(NotificationsService);

  /** Signal mirroring the live list of toasts. Read directly by the template. */
  protected readonly toasts = this.notifications.toasts;

  /**
   * Returns the Tailwind class bundle for the supplied severity.
   *
   * @param severity - Severity level of the toast being rendered.
   */
  protected styleFor(severity: ToastSeverity) {
    return SEVERITY_STYLES[severity];
  }

  /**
   * Dismisses the toast identified by `id`.
   *
   * @param id - Toast identifier provided by the {@link NotificationsService}.
   */
  protected dismiss(id: number): void {
    this.notifications.dismiss(id);
  }
}
