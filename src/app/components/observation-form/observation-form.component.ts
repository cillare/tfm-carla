import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ObservationDTO } from '../../observation.dto';
import { ObservationService } from '../../services/observation.service';

@Component({
  selector: 'app-observation-form',
  templateUrl: './observation-form.component.html',
  styleUrl: './observation-form.component.scss',
})
export class ObservationFormComponent implements OnInit {
  observationForm: FormGroup;
  isEditMode: boolean = false;
  observationId: number | null = null;

  constructor(
    private observationService: ObservationService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.observationForm = this.fb.group({
      species: ['', Validators.required],
      amount: [1, [Validators.required, Validators.min(1)]],
      age: [''],
      sex: [''],
      province: ['', Validators.required],
      location: [''],
      latitude: [null, [Validators.min(-90), Validators.max(90)]],
      longitude: [null, [Validators.min(-180), Validators.max(180)]],
      initial_date: [null],
      final_date: [null],
      observer: [''],
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.observationId = +id;
        this.loadObservation(this.observationId);
      }
    });
  }

  loadObservation(id: number): void {
    this.observationService.getObservation(id).subscribe(
      (data) => {
        this.observationForm.patchValue(data);
      },
      (error) => {
        console.error("Error en carregar l'observació", error);
      }
    );
  }

  saveObservation(): void {
    if (this.observationForm.invalid) {
      return;
    }

    const observationData = this.observationForm.value as ObservationDTO;

    if (this.isEditMode && this.observationId !== null) {
      this.observationService
        .updateObservation(this.observationId, observationData)
        .subscribe(
          (response) => {
            console.log('Observació actualitzada correctament', response);
            this.router.navigate(['/observations']);
          },
          (error) => {
            console.error("Error en actualitzar l'observació", error);
          }
        );
    } else {
      this.observationService.createObservation(observationData).subscribe(
        (response) => {
          console.log('Observació creada correctament', response);
          this.router.navigate(['/observations']);
        },
        (error) => {
          console.error("Error en crear l'observació", error);
        }
      );
    }
  }
}
