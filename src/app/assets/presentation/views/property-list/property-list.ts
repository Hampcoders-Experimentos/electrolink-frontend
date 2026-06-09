import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AssetsStoreService } from '../../../application/assets-store.service';
import { Property } from '../../../domain/model/property.entity';

@Component({
  selector: 'app-property-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
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
