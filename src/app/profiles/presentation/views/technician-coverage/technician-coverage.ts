import { ChangeDetectionStrategy, Component, input, output, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ElectroMapComponent, MapMarker } from '../../../../shared/presentation/components/electro-map/electro-map';

@Component({
  selector: 'app-technician-coverage',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ElectroMapComponent],
  templateUrl: './technician-coverage.html',
  styleUrl: './technician-coverage.css',
})
export class TechnicianCoverageComponent implements OnInit {
  initialLatitude = input<number>();
  initialLongitude = input<number>();
  initialRadius = input<number>(5000);

  saveCoverage = output<{ latitude: number, longitude: number, radius: number }>();
  cancel = output<void>();

  currentRadius = signal(5000);
  selectedLat = signal(-12.046374);
  selectedLng = signal(-77.042793);

  ngOnInit() {
    this.currentRadius.set(this.initialRadius());

    if (this.initialLatitude() && this.initialLongitude()) {
      this.selectedLat.set(this.initialLatitude()!);
      this.selectedLng.set(this.initialLongitude()!);
    } else if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        this.selectedLat.set(position.coords.latitude);
        this.selectedLng.set(position.coords.longitude);
      });
    }
  }

  center(): [number, number] {
    return [this.selectedLat(), this.selectedLng()];
  }

  markers(): MapMarker[] {
    return [{
      lat: this.selectedLat(),
      lng: this.selectedLng(),
      type: 'technician',
      popup: 'Centro de tu zona de cobertura'
    }];
  }

  onMapClick(event: { lat: number; lng: number }) {
    this.selectedLat.set(event.lat);
    this.selectedLng.set(event.lng);
  }

  onSave() {
    this.saveCoverage.emit({
      latitude: this.selectedLat(),
      longitude: this.selectedLng(),
      radius: this.currentRadius()
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}
