import { Injectable, signal } from '@angular/core';

export type ToastSeverity = 'success' | 'info' | 'warn' | 'error';

export interface ToastMessage {
  id: number;
  severity: ToastSeverity;
  summary: string;
  detail: string;
  life: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  private nextId = 1;

  showSuccess(summary: string, detail: string, life = 3500): void {
    this.push('success', summary, detail, life);
  }

  showInfo(summary: string, detail: string, life = 3500): void {
    this.push('info', summary, detail, life);
  }

  showWarn(summary: string, detail: string, life = 4500): void {
    this.push('warn', summary, detail, life);
  }

  showError(summary: string, detail: string, life = 5000): void {
    this.push('error', summary, detail, life);
  }

  dismiss(id: number): void {
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  private push(severity: ToastSeverity, summary: string, detail: string, life: number): void {
    const id = this.nextId++;
    this._toasts.update(list => [...list, { id, severity, summary, detail, life }]);
    if (life > 0) {
      setTimeout(() => this.dismiss(id), life);
    }
  }
}
