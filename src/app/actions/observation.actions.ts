import { createAction, props } from '@ngrx/store';
import { ObservationDTO } from '../observation.dto';

export const loadObservations = createAction('[Observation] Load Observations');
export const loadObservationsSuccess = createAction(
  '[Observation] Load Observations Success',
  props<{ observations: ObservationDTO[] }>()
);
export const loadObservationsFailure = createAction(
  '[Observation] Load Observations Failure',
  props<{ error: any }>()
);
