import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfilesStore } from '@profiles/application/profiles-store.service';
import { ProfileRole } from '@profiles/domain/model/profile.entity';
import { TechnicianCoverageComponent } from '../technician-coverage/technician-coverage';
import { IconComponent } from '@shared/presentation/components/icon/icon';

/**
 * Profile create / edit form.
 *
 * Dual-mode reactive form (driven by the presence of an `id` route param):
 * `Homeowner` profiles use a short variant, `Technician` profiles unlock
 * the professional details section plus the embedded
 * {@link TechnicianCoverageComponent} map dialog.
 *
 * ### State signals
 * - {@link isEditMode}      - True when a profile id was supplied via route params.
 * - {@link editId}          - Resolved id when editing, `null` on create.
 * - {@link selectedRole}    - Active role tab — switches conditional sections.
 * - {@link displayMap}      - Controls visibility of the coverage-map dialog.
 * - {@link latitude}        - Last latitude resolved from the coverage dialog.
 * - {@link longitude}       - Last longitude resolved from the coverage dialog.
 * - {@link coverageRadius}  - Coverage radius in meters.
 *
 * ### External dependencies
 * - {@link ProfilesStore} — `loadProfileById`, `createProfile`, `updateProfile`
 *   and the `loading()` / `errorMessage()` UI signals.
 *
 * ### Lifecycle
 * - `ngOnInit` builds the form and, when in edit mode, hydrates it via the store.
 */
@Component({
  selector: 'app-profile-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FormsModule, TechnicianCoverageComponent, IconComponent],
  templateUrl: './profile-form.html',
  styleUrl: './profile-form.css',
})
export class ProfileFormComponent implements OnInit {
  store = inject(ProfilesStore);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  profileForm!: FormGroup;
  isEditMode = signal(false);
  editId = signal<number | null>(null);
  selectedRole = signal<ProfileRole>('HOMEOWNER');

  displayMap = signal(false);
  latitude = signal<number | undefined>(undefined);
  longitude = signal<number | undefined>(undefined);
  coverageRadius = signal(5000);

  roleOptions = [
    { label: 'Propietario (Homeowner)', value: 'HOMEOWNER' as ProfileRole },
    { label: 'Técnico Especializado',   value: 'TECHNICIAN' as ProfileRole }
  ];

  specialtyOptions = [
    'Instalación Eléctrica General',
    'Mantenimiento de Paneles Solares',
    'Domótica y Smart Home',
    'Reparación de Electrodomésticos',
    'Redes de Alta Tensión'
  ];

  ngOnInit(): void {
    this.buildForm();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.editId.set(Number(idParam));
      this.loadProfile(Number(idParam));
    }
  }

  private buildForm(): void {
    this.profileForm = this.fb.group({
      firstName:    ['', [Validators.required, Validators.maxLength(30)]],
      lastName:     ['', [Validators.required, Validators.maxLength(30)]],
      email:        ['', [Validators.required, Validators.email]],
      street:       ['', [Validators.required, Validators.maxLength(100)]],
      dni:          [''],
      phoneNumber:  [''],
      specialties:  [''],
      yearsOfExperience: [0],
      certificationCode: [''],
      additionalInfo: ['']
    });
  }

  private loadProfile(id: number): void {
    this.store.loadProfileById(id).subscribe({
      next: profile => {
        this.selectedRole.set(profile.role);
        this.latitude.set(profile.latitude);
        this.longitude.set(profile.longitude);
        if (profile.coverageRadius) this.coverageRadius.set(profile.coverageRadius);

        this.profileForm.patchValue({
          firstName: profile.firstName, lastName: profile.lastName,
          email: profile.email, street: profile.street, dni: profile.dni,
          phoneNumber: profile.phoneNumber, specialties: profile.specialties,
          yearsOfExperience: profile.yearsOfExperience,
          certificationCode: profile.certificationCode,
          additionalInfo: profile.additionalInfo
        });
      }
    });
  }

  onRoleChange(role: ProfileRole) {
    this.selectedRole.set(role);
  }

  isFieldInvalid(field: string): boolean {
    const control = this.profileForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  showMapDialog() { this.displayMap.set(true); }

  onCoverageSaved(event: { latitude: number, longitude: number, radius: number }) {
    this.latitude.set(event.latitude);
    this.longitude.set(event.longitude);
    this.coverageRadius.set(event.radius);
    this.displayMap.set(false);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    const formData = this.profileForm.value;
    const resource = {
      ...formData,
      role: this.selectedRole(),
      latitude: this.latitude(),
      longitude: this.longitude(),
      coverageRadius: this.coverageRadius()
    };

    const editingId = this.editId();
    if (this.isEditMode() && editingId !== null) {
      const updateResource = { ...resource, id: editingId };
      this.store.updateProfile(updateResource, editingId).subscribe({
        next: () => this.router.navigate(['/profiles'])
      });
    } else {
      this.store.createProfile(resource).subscribe({
        next: () => this.router.navigate(['/profiles'])
      });
    }
  }

  goBack(): void { this.router.navigate(['/profiles']).then(); }
}
