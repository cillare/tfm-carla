import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from '../auth/services/auth.service';
import { ObservationDTO } from '../observation.dto';

@Injectable({
  providedIn: 'root',
})
export class ObservationService {
  private apiUrl = 'http://localhost:8000/api/observations';

  constructor(private http: HttpClient, private authService: AuthService) {}

  getObservations(): Observable<ObservationDTO[]> {
    return this.http.get<ObservationDTO[]>(this.apiUrl, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  getObservation(id: number): Observable<ObservationDTO> {
    return this.http.get<ObservationDTO>(`${this.apiUrl}/${id}`, {
      headers: this.authService.getAuthHeaders(),
    });
  }

  createObservation(observation: ObservationDTO): Observable<ObservationDTO> {
    return this.http
      .post<ObservationDTO>(this.apiUrl, observation, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  updateObservation(
    id: number,
    observation: ObservationDTO
  ): Observable<ObservationDTO> {
    return this.http
      .put<ObservationDTO>(`${this.apiUrl}/${id}`, observation, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  deleteObservation(id: number): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/${id}`, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(catchError(this.handleError));
  }

  getSpeciesByName(speciesName: string): Observable<ObservationDTO[]> {
    return this.http
      .get<ObservationDTO[]>(this.apiUrl, {
        headers: this.authService.getAuthHeaders(),
      })
      .pipe(
        map((observations: ObservationDTO[]) =>
          observations.filter(
            (observation) => observation.species === speciesName
          )
        ),
        catchError(this.handleError)
      );
  }

  getFilteredObservations(filters: any): Observable<ObservationDTO[]> {
    return this.getObservations().pipe(
      map((observations) =>
        observations.filter((observation) => {
          const initialDate = observation.initial_date
            ? new Date(observation.initial_date)
            : null;
          const finalDate = observation.final_date
            ? new Date(observation.final_date)
            : null;
          const filterStartDate = filters.startDate
            ? new Date(filters.startDate)
            : null;
          const filterEndDate = filters.endDate
            ? new Date(filters.endDate)
            : null;

          return (
            (!filters.species || observation.species === filters.species) &&
            (!filters.location || observation.location === filters.location) &&
            (!filters.amount || observation.amount === +filters.amount) &&
            (!filters.year ||
              (initialDate && initialDate.getFullYear() === +filters.year) ||
              (finalDate && finalDate.getFullYear() === +filters.year)) &&
            (!filters.age || observation.age === filters.age) &&
            (!filters.province || observation.province === filters.province) &&
            (!filters.sex || observation.sex === filters.sex) &&
            (!filterStartDate ||
              (initialDate && initialDate >= filterStartDate)) &&
            (!filterEndDate || (finalDate && finalDate <= filterEndDate))
          );
        })
      ),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('Hi ha hagut un error:', error.error.message);
    } else {
      console.error(
        `Error del servidor ${error.status}, ` + `missatge: ${error.error}`
      );
    }
    return throwError(
      'Error en obtenir les observacions. Si us plau, intenta-ho de nou més tard.'
    );
  }
}
