import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as ObservationActions from '../actions/observation.actions';
import { ObservationService } from '../services/observation.service';

@Injectable()
export class ObservationEffects {
  loadObservations$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ObservationActions.loadObservations),
      switchMap(() =>
        this.observationService.getObservations().pipe(
          map((observations) => {
            return ObservationActions.loadObservationsSuccess({ observations });
          }),
          catchError((error) => {
            return of(ObservationActions.loadObservationsFailure({ error }));
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private observationService: ObservationService
  ) {}
}
