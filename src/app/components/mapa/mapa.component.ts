import { Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as L from 'leaflet';
import { loadObservations } from '../../actions/observation.actions';
import { ObservationDTO } from '../../observation.dto';
import { AppState } from '../../reducers/app.reducers';
import { ObservationService } from '../../services/observation.service';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss'],
})
export class MapaComponent implements OnInit, OnDestroy {
  speciesData: ObservationDTO[] = [];
  map: L.Map | null = null;

  constructor(
    private observationService: ObservationService,
    private store: Store<AppState>
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadObservations());

    this.observationService.getObservations().subscribe((data) => {
      this.speciesData = data;
      this.initMap();
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  initMap(): void {
    setTimeout(() => {
      this.map = L.map('mapa').setView([41.3851, 2.1734], 8);

      L.Icon.Default.imagePath = 'assets/';

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      this.updateMap();
    }, 0);
  }

  updateMap(): void {
    if (!this.map) {
      return;
    }

    this.map.eachLayer((layer) => {
      if ((layer as L.Marker).getLatLng) {
        this.map?.removeLayer(layer);
      }
    });

    this.speciesData.forEach((observation) => {
      if (observation.latitude && observation.longitude) {
        L.marker([observation.latitude, observation.longitude])
          .addTo(this.map!)
          .bindPopup(
            `<b>Espècie:</b> <a href="/species/${observation.species}">${observation.species}</a><br>
            <b>Localitat:</b> ${observation.location}<br>
            <b>Latitud:</b> ${observation.latitude}<br>
            <b>Longitud:</b> ${observation.longitude}`
          );
      }
    });
  }
}
