import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ObservationDTO } from '../../observation.dto';
import { ObservationService } from '../../services/observation.service';

@Component({
  selector: 'app-observations',
  templateUrl: './observations.component.html',
  styleUrls: ['./observations.component.scss'],
})
export class ObservationsComponent implements OnInit {
  observations: ObservationDTO[] = [];

  constructor(
    private observationService: ObservationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getObservations();
  }

  getObservations(): void {
    this.observationService.getObservations().subscribe(
      (data) => {
        this.observations = data;
      },
      (error) => {
        console.error('Error en obtenir observacions', error);
      }
    );
  }

  createObservation(): void {
    this.router.navigate(['/observation-form']);
  }

  updateObservation(observation: ObservationDTO): void {
    this.router.navigate(['/observation-form', observation.id]);
  }

  confirmDelete(observationId: string): void {
    const result = window.confirm(
      'Segur que vols eliminar aquesta observació?'
    );
    if (result) {
      this.deleteObservation(observationId);
    }
  }

  deleteObservation(observationId: string): void {
    this.observationService.deleteObservation(+observationId).subscribe(
      (response) => {
        console.log('Observació eliminada correctament', response);
        this.getObservations();
      },
      (error) => {
        console.error('Error en eliminar observacions', error);
      }
    );
  }
}
