import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AssetsStoreService } from '@assets/application/assets-store.service';
import { Property } from '@assets/domain/model/property.entity';
import { IconComponent } from '@shared/presentation/components/icon/icon';

@Component({
  selector: 'app-property-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  templateUrl: './property-list.html',
  styleUrl: './property-list.css',
})
export class PropertyListComponent implements OnInit {
  store = inject(AssetsStoreService);
  private router = inject(Router);

  propertyToDelete = signal<Property | null>(null);

  ngOnInit(): void {
    this.store.loadProperties().subscribe();
  }

  goToCreate(): void {
    this.router.navigate(['/assets/new']);
  }

  goToEdit(id: string | number): void {
    this.router.navigate(['/assets', id, 'edit']);
  }

  confirmDelete(property: Property): void {
    this.propertyToDelete.set(property);
  }

  cancelDelete(): void {
    this.propertyToDelete.set(null);
  }

  executeDelete(): void {
    const property = this.propertyToDelete();
    if (property) {
      this.store.deleteProperty(property.id).subscribe({
        next: () => this.propertyToDelete.set(null)
      });
    }
  }
}
