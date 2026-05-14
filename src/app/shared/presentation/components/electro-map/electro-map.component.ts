import {
  Component, ElementRef, ViewChild, input, output,
  OnInit, OnDestroy, OnChanges, SimpleChanges
} from '@angular/core';
import * as L from 'leaflet';

export interface MapMarker {
  lat: number;
  lng: number;
  popup?: string;
  type?: 'property' | 'technician' | 'service';
}

@Component({
  selector: 'el-map',
  standalone: true,
  template: `<div #mapContainer class="el-map" [style.height]="height()"></div>`,
  styles: [`
    .el-map { width: 100%; border-radius: 8px; z-index: 0; }
    :host ::ng-deep .el-map-icon { background: transparent; border: none; }
  `],
})
export class ElectroMapComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>;

  center = input<[number, number]>([-12.046374, -77.042793]); // Lima, Perú
  zoom = input<number>(12);
  markers = input<MapMarker[]>([]);
  height = input<string>('400px');
  coverageRadius = input<number | undefined>(undefined);

  markerClick = output<MapMarker>();
  mapClick = output<{ lat: number; lng: number }>();

  private map!: L.Map;
  private markerLayer!: L.LayerGroup;
  private coverageCircle?: L.Circle;

  private icons: Record<string, L.DivIcon> = {
    property: L.divIcon({
      html: '<i class="pi pi-home" style="font-size:1.4rem;color:#1E40AF"></i>',
      className: 'el-map-icon', iconSize: [30, 30], iconAnchor: [15, 30],
    }),
    technician: L.divIcon({
      html: '<i class="pi pi-wrench" style="font-size:1.4rem;color:#F59E0B"></i>',
      className: 'el-map-icon', iconSize: [30, 30], iconAnchor: [15, 30],
    }),
    service: L.divIcon({
      html: '<i class="pi pi-bolt" style="font-size:1.4rem;color:#10B981"></i>',
      className: 'el-map-icon', iconSize: [30, 30], iconAnchor: [15, 30],
    }),
  };

  ngOnInit(): void {
    // Fix Leaflet default marker icons en Angular
    const iconDefault = L.icon({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = iconDefault;

    this.map = L.map(this.mapContainer.nativeElement).setView(this.center(), this.zoom());

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);

    this.map.on('click', (e) => {
      this.mapClick.emit({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    this.renderMarkers();
    this.renderCoverage();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.map) return;
    if (changes['markers']) this.renderMarkers();
    if (changes['coverageRadius'] || changes['center']) this.renderCoverage();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  private renderMarkers(): void {
    this.markerLayer?.clearLayers();
    this.markers().forEach((m) => {
      const icon = m.type ? this.icons[m.type] : undefined;
      const marker = icon
        ? L.marker([m.lat, m.lng], { icon })
        : L.marker([m.lat, m.lng]);
      if (m.popup) marker.bindPopup(m.popup);
      marker.on('click', () => this.markerClick.emit(m));
      this.markerLayer?.addLayer(marker);
    });
  }

  private renderCoverage(): void {
    this.coverageCircle?.remove();
    const radius = this.coverageRadius();
    if (radius && this.center()) {
      this.coverageCircle = L.circle(this.center(), {
        radius,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(this.map);
    }
  }
}
