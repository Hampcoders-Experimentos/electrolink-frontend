import { Component, inject, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ElectroMapComponent, MapMarker } from '../../../../shared/presentation/components/electro-map/electro-map.component';
import { SliderModule } from 'primeng/slider';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-technician-coverage',
  standalone: true,
  imports: [CommonModule, FormsModule, ElectroMapComponent, SliderModule, ButtonModule, InputNumberModule],
  template: `
    <div class="flex flex-col gap-4">
      <div class="p-4 bg-[var(--el-bg-soft)] border border-[var(--el-warm-gray)] rounded-xl">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Ajustar Zona de Cobertura</h3>
        <p class="text-sm text-gray-600 mb-4">Haz clic en el mapa para establecer el centro de tu zona de trabajo y usa el deslizador para ajustar el radio en metros.</p>
        
        <div class="flex items-center gap-4 mb-4">
          <div class="flex-1">
            <label class="text-sm font-medium text-gray-700 block mb-1">Radio de Cobertura (m)</label>
            <p-slider [(ngModel)]="currentRadius" [min]="1000" [max]="50000" [step]="500" class="w-full"></p-slider>
          </div>
          <div class="w-32">
            <p-inputNumber [(ngModel)]="currentRadius" [min]="1000" [max]="50000" suffix=" m" styleClass="w-full"></p-inputNumber>
          </div>
        </div>
      </div>

      <div class="h-[400px] rounded-xl overflow-hidden shadow-sm border border-[var(--el-warm-gray)] relative">
        <el-map 
          [center]="center()" 
          [coverageRadius]="currentRadius"
          [markers]="markers()"
          (mapClick)="onMapClick($event)"
          height="100%">
        </el-map>
      </div>

      <div class="flex justify-end gap-2 mt-2">
        <p-button label="Cancelar" severity="secondary" (onClick)="onCancel()"></p-button>
        <p-button label="Guardar Cobertura" styleClass="bg-[var(--el-primary)]" (onClick)="onSave()"></p-button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class TechnicianCoverageComponent implements OnInit {
  initialLatitude = input<number>();
  initialLongitude = input<number>();
  initialRadius = input<number>(5000);

  saveCoverage = output<{ latitude: number, longitude: number, radius: number }>();
  cancel = output<void>();

  currentRadius = 5000;
  selectedLat!: number;
  selectedLng!: number;

  ngOnInit() {
    this.currentRadius = this.initialRadius();
    
    if (this.initialLatitude() && this.initialLongitude()) {
      this.selectedLat = this.initialLatitude()!;
      this.selectedLng = this.initialLongitude()!;
    } else {
      // Default to Lima if no coordinates provided, but in a real app would use Geolocation API
      this.selectedLat = -12.046374;
      this.selectedLng = -77.042793;
      
      // Try to get user location
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(position => {
          this.selectedLat = position.coords.latitude;
          this.selectedLng = position.coords.longitude;
        });
      }
    }
  }

  center(): [number, number] {
    return [this.selectedLat, this.selectedLng];
  }

  markers(): MapMarker[] {
    return [{
      lat: this.selectedLat,
      lng: this.selectedLng,
      type: 'technician',
      popup: 'Centro de tu zona de cobertura'
    }];
  }

  onMapClick(event: { lat: number; lng: number }) {
    this.selectedLat = event.lat;
    this.selectedLng = event.lng;
  }

  onSave() {
    this.saveCoverage.emit({
      latitude: this.selectedLat,
      longitude: this.selectedLng,
      radius: this.currentRadius
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}
