import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import { Store } from '@ngrx/store';
import { loadObservations } from '../../actions/observation.actions';
import { AppState } from '../../reducers/app.reducers';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  myControl = new FormControl();
  speciesList$!: Observable<string[]>;
  filteredOptions!: Observable<string[]>;

  constructor(private store: Store<AppState>, private router: Router) {}

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
          return of(Array.from(speciesSet));
        })
      );

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) => this._filter(value))
    );
  }

  private _filter(value: string): Observable<string[]> {
    const filterValue = value.toLowerCase();
    return this.speciesList$.pipe(
      map((species) =>
        species.filter((s) => s.toLowerCase().includes(filterValue))
      )
    );
  }

  redirectToSingleSpecies(speciesName: string) {
    this.router.navigate(['/species', speciesName]);
  }
}
