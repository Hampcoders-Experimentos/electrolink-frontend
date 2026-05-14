import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SdpStoreService } from '../../../application/sdp-store.service';
import { ScheduleAggregate } from '../../../domain/model/schedule.entity';

@Component({
  selector: 'app-schedule-calendar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="calendar-container">
      <div class="calendar-wrapper">

        <!-- Header -->
        <div class="calendar-header">
          <div class="header-left">
            <div class="header-icon">
              <span class="icon-circle">📅</span>
            </div>
            <div>
              <h1>Horarios y Disponibilidad del Técnico</h1>
              <p>Consulta y gestiona las franjas horarias de atención para visitas técnicas</p>
            </div>
          </div>

          <div class="header-actions">
            <button class="btn-primary" (click)="toggleModal(true)">
              + Agregar Horario
            </button>
          </div>
        </div>

        <!-- Loading state -->
        <div *ngIf="store.loading()" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Cargando calendario de horarios...</p>
        </div>

        <!-- Error state -->
        <div *ngIf="store.errorMessage()" class="error-state">
          <span>⚠️</span> {{ store.errorMessage() }}
        </div>

        <!-- Weekly Calendar Grid -->
        <div class="weekly-grid" *ngIf="!store.loading()">
          <div class="day-col" *ngFor="let day of weekDays">
            <div class="day-header">
              <h3>{{ day.label }}</h3>
              <span>{{ day.date }}</span>
            </div>

            <div class="slots-container">
              <div
                class="slot-card"
                *ngFor="let slot of getSlotsForDate(day.date)"
                [class.available]="slot.isAvailable"
                [class.booked]="!slot.isAvailable"
              >
                <div class="slot-time">🕒 {{ slot.startTime }} - {{ slot.endTime }}</div>
                <div class="slot-status">
                  <span class="status-badge">{{ slot.isAvailable ? 'Disponible' : 'Reservado' }}</span>
                </div>
              </div>

              <div *ngIf="getSlotsForDate(day.date).length === 0" class="empty-slot">
                <span>Sin horarios</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Schedule Modal -->
        <div class="modal-overlay" *ngIf="showModal()" (click)="toggleModal(false)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h3>Nueva Franja Horaria</h3>
              <button class="btn-close" (click)="toggleModal(false)">×</button>
            </div>

            <form [formGroup]="scheduleForm" (ngSubmit)="onSubmitSchedule()">
              <div class="form-group">
                <label for="date">Fecha</label>
                <input type="date" id="date" formControlName="date" class="form-control" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="startTime">Hora de Inicio</label>
                  <input type="time" id="startTime" formControlName="startTime" class="form-control" />
                </div>
                <div class="form-group">
                  <label for="endTime">Hora de Fin</label>
                  <input type="time" id="endTime" formControlName="endTime" class="form-control" />
                </div>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn-secondary" (click)="toggleModal(false)">Cancelar</button>
                <button type="submit" [disabled]="scheduleForm.invalid" class="btn-primary">💾 Guardar Horario</button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .calendar-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      padding: 2rem 1rem;
      color: #f8fafc;
    }

    .calendar-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Header */
    .calendar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .icon-circle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 0.875rem;
      font-size: 1.25rem;
      box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.35);
    }

    .calendar-header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(to right, #34d399, #10b981);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .calendar-header p {
      color: #64748b;
      font-size: 0.85rem;
      margin: 0.15rem 0 0;
    }

    .btn-primary {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      border: none;
      border-radius: 0.75rem;
      padding: 0.75rem 1.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 20px -4px rgba(16, 185, 129, 0.4);
    }

    /* Weekly Grid */
    .weekly-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1rem;
    }

    @media (max-width: 900px) {
      .weekly-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 560px) {
      .weekly-grid {
        grid-template-columns: 1fr;
      }
    }

    .day-col {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 1rem;
      overflow: hidden;
    }

    .day-header {
      background: rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding: 1rem;
      text-align: center;
    }

    .day-header h3 {
      margin: 0 0 0.2rem;
      font-size: 0.95rem;
      font-weight: 600;
      color: #f8fafc;
    }

    .day-header span {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .slots-container {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .slot-card {
      border-radius: 0.75rem;
      padding: 0.85rem;
      border: 1px solid transparent;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      transition: all 0.2s;
    }

    .slot-card.available {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.2);
    }

    .slot-card.booked {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.2);
      opacity: 0.7;
    }

    .slot-time {
      font-size: 0.8rem;
      font-weight: 600;
      color: #f8fafc;
    }

    .status-badge {
      font-size: 0.7rem;
      padding: 0.2rem 0.5rem;
      border-radius: 0.35rem;
      font-weight: 600;
    }

    .slot-card.available .status-badge {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
    }

    .slot-card.booked .status-badge {
      background: rgba(239, 68, 68, 0.2);
      color: #fca5a5;
    }

    .empty-slot {
      text-align: center;
      padding: 2rem 0;
      color: #64748b;
      font-size: 0.8rem;
      font-style: italic;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.15s ease-out;
    }

    .modal-card {
      background: #1e293b;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 1.25rem;
      padding: 2rem;
      max-width: 460px;
      width: 90%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .btn-close {
      background: none;
      border: none;
      color: #94a3b8;
      font-size: 1.5rem;
      cursor: pointer;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      margin-bottom: 1rem;
    }

    .form-group label {
      font-size: 0.8rem;
      font-weight: 500;
      color: #94a3b8;
    }

    .form-control {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      color: #f8fafc;
      font-family: inherit;
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #94a3b8;
      border-radius: 0.75rem;
      padding: 0.75rem 1.5rem;
      cursor: pointer;
    }
  `]
})
export class ScheduleCalendarComponent implements OnInit {
  store = inject(SdpStoreService);
  private fb = inject(FormBuilder);

  showModal = signal<boolean>(false);
  scheduleForm!: FormGroup;

  weekDays = [
    { label: 'Lunes', date: '2026-06-15' },
    { label: 'Martes', date: '2026-06-16' },
    { label: 'Miércoles', date: '2026-06-17' },
    { label: 'Jueves', date: '2026-06-18' },
    { label: 'Viernes', date: '2026-06-19' }
  ];

  ngOnInit(): void {
    this.buildForm();
    this.store.loadTechnicianSchedules(3).subscribe(); // Load for technician 3
  }

  private buildForm(): void {
    this.scheduleForm = this.fb.group({
      date: ['2026-06-15', Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['11:00', Validators.required]
    });
  }

  getSlotsForDate(date: string): ScheduleAggregate[] {
    return this.store.technicianSchedules().filter(s => s.date === date);
  }

  toggleModal(show: boolean): void {
    this.showModal.set(show);
  }

  onSubmitSchedule(): void {
    if (this.scheduleForm.invalid) return;

    const data = {
      technicianId: 3,
      date: this.scheduleForm.value.date,
      startTime: this.scheduleForm.value.startTime,
      endTime: this.scheduleForm.value.endTime,
      isAvailable: true
    };

    this.store.createSchedule(data).subscribe({
      next: () => {
        this.toggleModal(false);
        this.scheduleForm.reset({ date: '2026-06-15', startTime: '09:00', endTime: '11:00' });
      }
    });
  }
}
