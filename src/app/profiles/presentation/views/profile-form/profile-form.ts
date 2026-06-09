import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProfilesStore } from '../../../application/profiles-store.service';
import { ProfileRole } from '../../../domain/model/profile.entity';
import { TechnicianCoverageComponent } from '../technician-coverage/technician-coverage';
import { IconComponent } from '../../../../shared/presentation/components/icon/icon';

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
  isEditMode = false;
  editId: number | null = null;
  selectedRole: ProfileRole = 'HOMEOWNER';

  displayMap = signal(false);
  latitude?: number;
  longitude?: number;
  coverageRadius = 5000;

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
      this.isEditMode = true;
      this.editId = Number(idParam);
      this.loadProfile(this.editId);
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
        this.selectedRole = profile.role;
        this.latitude = profile.latitude;
        this.longitude = profile.longitude;
        if (profile.coverageRadius) this.coverageRadius = profile.coverageRadius;

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
    this.selectedRole = role;
  }

  isFieldInvalid(field: string): boolean {
    const control = this.profileForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  showMapDialog() { this.displayMap.set(true); }

  onCoverageSaved(event: { latitude: number, longitude: number, radius: number }) {
    this.latitude = event.latitude;
    this.longitude = event.longitude;
    this.coverageRadius = event.radius;
    this.displayMap.set(false);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    const formData = this.profileForm.value;
    const resource = {
      ...formData,
      role: this.selectedRole,
      latitude: this.latitude,
      longitude: this.longitude,
      coverageRadius: this.coverageRadius
    };

    if (this.isEditMode && this.editId) {
      const updateResource = { ...resource, id: this.editId };
      this.store.updateProfile(updateResource, this.editId).subscribe({
        next: () => this.router.navigate(['/profiles'])
      });
    } else {
      this.store.createProfile(resource).subscribe({
        next: () => this.router.navigate(['/profiles'])
      });
    }
  }

  goBack(): void { this.router.navigate(['/profiles']); }
}
