import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SdpStoreService } from '@sdp/application/sdp-store.service';
import { ScheduleAggregate } from '@sdp/domain/model/schedule.entity';

/**
 * Technician weekly schedule view.
 *
 * Weekly grid that lists the available/booked slots per day and exposes an
 * inline form for registering new time slots.
 *
 * ### State signals
 * - {@link showModal} - Drives the "new slot" modal.
 *
 * ### External dependencies
 * - {@link SdpStoreService} — `loadTechnicianSchedules`, `createSchedule`,
 *   `technicianSchedules()`, `loading()`, `errorMessage()`.
 *
 * ### Lifecycle
 * - `ngOnInit` builds the slot form and fetches schedules for technician #3
 *   (placeholder until the auth-derived technician id is wired up).
 */
@Component({
  selector: 'app-schedule-calendar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './schedule-calendar.html',
  styleUrl: './schedule-calendar.css',
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
    this.store.loadTechnicianSchedules(3).subscribe();
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
