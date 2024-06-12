import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { loadObservations } from '../../actions/observation.actions';
import { AppState } from '../../reducers/app.reducers';
import { BirdImageService } from '../../services/bird-image.service';

@Component({
  selector: 'app-species',
  templateUrl: './species.component.html',
  styleUrls: ['./species.component.scss'],
})
export class SpeciesComponent implements OnInit {
  speciesList$!: Observable<string[]>;
  speciesImages: { [species: string]: string | null } = {};

  constructor(
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private router: Router,
    private birdImageService: BirdImageService
  ) {}

  ngOnInit(): void {
    this.store.dispatch(loadObservations());

    this.speciesList$ = this.store
      .select((state) => state.observations)
      .pipe(
        switchMap((observations) => {
          const speciesSet = new Set<string>();
          observations.forEach((observation) => {
            speciesSet.add(observation.species);
          });
          const speciesList = Array.from(speciesSet);
          return of(speciesList);
        })
      );

    this.speciesList$.subscribe((speciesList) => {
      speciesList.forEach((species) => {
        this.birdImageService.getBirdImage(species).subscribe(
          (imageUrl) => {
            this.speciesImages[species] = imageUrl;
          },
          (error) => {
            console.error('Error fetching bird image for', species, error);
          }
        );
      });
    });
  }

  redirectToSpecies(speciesName: string): void {
    this.router.navigate(['/species', speciesName]);
  }
}
