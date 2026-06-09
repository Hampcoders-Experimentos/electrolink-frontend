import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  inject,
  input,
  OnDestroy,
  output,
  viewChild,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './electro-map.html',
  styleUrl: './electro-map.css',
})
export class ElectroMapComponent implements OnDestroy {
  private readonly mapContainer = viewChild.required<ElementRef<HTMLDivElement>>('mapContainer');

  center = input<[number, number]>([-12.046374, -77.042793]);
  zoom = input<number>(12);
  markers = input<MapMarker[]>([]);
  height = input<string>('400px');
  coverageRadius = input<number | undefined>(undefined);

  markerClick = output<MapMarker>();
  mapClick = output<{ lat: number; lng: number }>();

  private map?: L.Map;
  private markerLayer?: L.LayerGroup;
  private coverageCircle?: L.Circle;

  private static readonly SVG_HOME =
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1E40AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.25 12l9-9 9 9M4.5 9.75v9.75A1.5 1.5 0 006 21h3v-6h6v6h3a1.5 1.5 0 001.5-1.5V9.75"/></svg>';
  private static readonly SVG_WRENCH =
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63"/></svg>';
  private static readonly SVG_BOLT =
    '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>';

  private icons: Record<string, L.DivIcon> = {
    property: L.divIcon({ html: ElectroMapComponent.SVG_HOME, className: 'el-map-icon', iconSize: [30, 30], iconAnchor: [15, 30] }),
    technician: L.divIcon({ html: ElectroMapComponent.SVG_WRENCH, className: 'el-map-icon', iconSize: [30, 30], iconAnchor: [15, 30] }),
    service: L.divIcon({ html: ElectroMapComponent.SVG_BOLT, className: 'el-map-icon', iconSize: [30, 30], iconAnchor: [15, 30] }),
  };

  constructor() {
    // 1) Create the Leaflet map after the first render (zoneless-safe; no NgZone).
    afterNextRender(() => this.initMap());

    // 2) Reactive effects: re-render when inputs change.
    effect(() => {
      const markers = this.markers();
      if (this.map) this.renderMarkers(markers);
    });

    effect(() => {
      const center = this.center();
      const radius = this.coverageRadius();
      if (this.map) this.renderCoverage(center, radius);
    });
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = undefined;
  }

  private initMap(): void {
    L.Marker.prototype.options.icon = L.icon({
      iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
      iconUrl: 'assets/leaflet/marker-icon.png',
      shadowUrl: 'assets/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });

    this.map = L.map(this.mapContainer().nativeElement).setView(this.center(), this.zoom());

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.markerLayer = L.layerGroup().addTo(this.map);

    this.map.on('click', (e) => {
      this.mapClick.emit({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    // Initial render — effects above re-run on input changes.
    this.renderMarkers(this.markers());
    this.renderCoverage(this.center(), this.coverageRadius());
  }

  private renderMarkers(markers: MapMarker[]): void {
    this.markerLayer?.clearLayers();
    markers.forEach((m) => {
      const icon = m.type ? this.icons[m.type] : undefined;
      const marker = icon ? L.marker([m.lat, m.lng], { icon }) : L.marker([m.lat, m.lng]);
      if (m.popup) marker.bindPopup(m.popup);
      marker.on('click', () => this.markerClick.emit(m));
      this.markerLayer?.addLayer(marker);
    });
  }

  private renderCoverage(center: [number, number], radius?: number): void {
    this.coverageCircle?.remove();
    if (radius && center) {
      this.coverageCircle = L.circle(center, {
        radius,
        color: '#3B82F6',
        fillColor: '#3B82F6',
        fillOpacity: 0.15,
        weight: 2,
      }).addTo(this.map!);
    }
  }
}
