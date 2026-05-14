import { Injectable, signal } from '@angular/core';
import { Property } from '../domain/model/property.entity';
import { InventoryItem } from '../domain/model/inventory-item.entity';
import { AssetsApiService } from '../infrastructure/assets-api.service';
import { Observable, tap } from 'rxjs';
import { CreatePropertyResource, PropertyResource } from '../infrastructure/property-response';

/**
 * State management store for the Assets bounded context.
 * Uses Angular Signals for reactive state management.
 */
@Injectable({ providedIn: 'root' })
export class AssetsStoreService {
  // --- Private signals ---
  private readonly propertiesSignal = signal<Property[]>([]);
  private readonly currentPropertySignal = signal<Property | null>(null);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<string | null>(null);

  // Inventory Signal initialized with default mock data
  private readonly inventorySignal = signal<InventoryItem[]>([
    {
      id: 'inv-1', name: 'Cable AWG 14', category: 'Conductores',
      stock: 50, minStock: 20, unit: 'm', unitCost: 2.5,
    },
    {
      id: 'inv-2', name: 'Interruptor Termomagnético 20A', category: 'Protección',
      stock: 3, minStock: 5, unit: 'und', unitCost: 35,
    },
    {
      id: 'inv-3', name: 'Tomacorriente Doble', category: 'Accesorios',
      stock: 15, minStock: 10, unit: 'und', unitCost: 12,
    },
  ]);

  // --- Public readonly accessors ---
  readonly properties = this.propertiesSignal.asReadonly();
  readonly currentProperty = this.currentPropertySignal.asReadonly();
  readonly inventory = this.inventorySignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly errorMessage = this.errorSignal.asReadonly();

  constructor(private assetsApi: AssetsApiService) {}

  /**
   * Loads all properties from the API.
   */
  loadProperties(): Observable<Property[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.assetsApi.getProperties().pipe(
      tap({
        next: properties => {
          this.propertiesSignal.set(properties);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al cargar la lista de propiedades.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  /**
   * Loads a single property by ID.
   */
  loadPropertyById(id: string | number): Observable<Property> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.assetsApi.getPropertyById(id).pipe(
      tap({
        next: property => {
          this.currentPropertySignal.set(property);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al cargar la propiedad.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  /**
   * Creates a new property.
   */
  addProperty(data: CreatePropertyResource): Observable<Property> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.assetsApi.createProperty(data).pipe(
      tap({
        next: created => {
          this.propertiesSignal.update(properties => [...properties, created]);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al crear la propiedad. Inténtelo de nuevo.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  /**
   * Updates an existing property.
   */
  updateProperty(data: PropertyResource, id: string | number): Observable<Property> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.assetsApi.updateProperty(data, id).pipe(
      tap({
        next: updated => {
          this.propertiesSignal.update(properties =>
            properties.map(p => p.id === id ? updated : p)
          );
          this.currentPropertySignal.set(updated);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al actualizar la propiedad.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  /**
   * Deletes a property by ID.
   */
  deleteProperty(id: string | number): Observable<void> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.assetsApi.deleteProperty(id).pipe(
      tap({
        next: () => {
          this.propertiesSignal.update(properties => properties.filter(p => p.id !== id));
          this.loadingSignal.set(false);
        },
        error: () => {
          this.errorSignal.set('Error al eliminar la propiedad.');
          this.loadingSignal.set(false);
        }
      })
    );
  }

  // --- Inventory Management Methods ---

  loadInventory(): void {
    // Inventory is already pre-loaded with initial signals
    this.loadingSignal.set(false);
  }

  addInventoryItem(item: Omit<InventoryItem, 'id'>): void {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`
    };
    this.inventorySignal.update(items => [...items, newItem]);
  }

  updateInventoryItem(updatedItem: InventoryItem): void {
    this.inventorySignal.update(items =>
      items.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
  }

  deleteInventoryItem(id: string): void {
    this.inventorySignal.update(items => items.filter(item => item.id !== id));
  }

  updateStock(id: string, newStock: number): void {
    this.inventorySignal.update(items =>
      items.map(item => item.id === id ? { ...item, stock: newStock } : item)
    );
  }

  /**
   * Clears the current property selection.
   */
  clearCurrentProperty(): void {
    this.currentPropertySignal.set(null);
  }

  /**
   * Clears any error messages.
   */
  clearError(): void {
    this.errorSignal.set(null);
  }
}

