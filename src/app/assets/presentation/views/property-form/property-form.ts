import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AssetsStoreService } from '@assets/application/assets-store.service';

@Component({
  selector: 'app-property-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './property-form.html',
  styleUrl: './property-form.css',
})
export class PropertyFormComponent implements OnInit {
  store = inject(AssetsStoreService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  propertyForm!: FormGroup;
  isEditMode = signal(false);
  editId = signal<string | number | null>(null);

  ngOnInit(): void {
    this.buildForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode.set(true);
      this.editId.set(idParam);
      this.loadProperty(idParam);
    }
  }

  private buildForm(): void {
    this.propertyForm = this.fb.group({
      address: ['', [Validators.required, Validators.maxLength(150)]],
      region:  ['', [Validators.required, Validators.maxLength(50)]],
      district: ['', [Validators.required, Validators.maxLength(50)]],
      ownerId: [1, [Validators.required, Validators.min(1)]]
    });
  }

  private loadProperty(id: string | number): void {
    this.store.loadPropertyById(id).subscribe({
      next: property => {
        this.propertyForm.patchValue({
          address: property.address,
          region: property.region,
          district: property.district,
          ownerId: property.ownerId
        });
      }
    });
  }

  isFieldInvalid(field: string): boolean {
    const control = this.propertyForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.propertyForm.invalid) return;

    const formData = this.propertyForm.value;
    const resource = {
      ...formData,
      photos: []
    };

    const editingId = this.editId();
    if (this.isEditMode() && editingId !== null) {
      const updateResource = { ...resource, id: editingId };
      this.store.updateProperty(updateResource, editingId).subscribe({
        next: () => this.router.navigate(['/assets'])
      });
    } else {
      this.store.addProperty(resource).subscribe({
        next: () => this.router.navigate(['/assets'])
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/assets']);
  }
}
