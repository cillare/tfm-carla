import { ActionReducerMap } from '@ngrx/store';
import { loadObservationsSuccess } from '../actions/observation.actions';
import * as AuthReducer from '../auth/reducers';
import { ObservationDTO } from '../observation.dto';

export interface AppState {
  observations: ObservationDTO[];
  auth: AuthReducer.AuthState;
}

export const reducers: ActionReducerMap<AppState> = {
  observations: observationsReducer,
  auth: AuthReducer.authReducer,
};

export function observationsReducer(state: ObservationDTO[] = [], action: any) {
  switch (action.type) {
    case loadObservationsSuccess.type:
      return [...state, ...action.observations];
    default:
      return state;
  }
}
