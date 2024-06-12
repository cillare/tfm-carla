import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ObservationDTO } from '../../../observation.dto';
import { ObservationService } from '../../../services/observation.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  providers: [DatePipe],
})
export class HeaderComponent implements OnInit {
  totalObservationsLastYear: number = 0;
  lastYearWithObservations: number = 0;
  totalUniqueSpeciesLastYear: number = 0;
  totalObservationsAll: number = 0;
  totalUniqueSpeciesAll: number = 0;
  lastSpecies: string = '';
  lastFinalDate: string | null = null;

  constructor(
    private router: Router,
    private observationService: ObservationService,
    private datePipe: DatePipe,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.calculateObservationsLastYear();
    this.calculateUniqueSpeciesLastYear();
    this.calculateTotalObservationsAll();
    this.calculateUniqueSpeciesAll();
    this.calculateLastSpeciesAndDate();
  }

  calculateObservationsLastYear() {
    const currentDate = new Date();
    const lastYear = currentDate.getFullYear() - 1;

    this.observationService
      .getObservations()
      .subscribe((observations: ObservationDTO[]) => {
        this.lastYearWithObservations = lastYear;
        this.totalObservationsLastYear = observations.filter((obs) => {
          const obsDate = new Date(obs.initial_date);
          return obsDate.getFullYear() === lastYear;
        }).length;
      });
  }

  calculateUniqueSpeciesLastYear() {
    const currentDate = new Date();
    const lastYear = currentDate.getFullYear() - 1;

    this.observationService
      .getObservations()
      .subscribe((observations: ObservationDTO[]) => {
        const uniqueSpeciesLastYear = new Set<string>();

        observations.forEach((obs) => {
          const obsDate = new Date(obs.initial_date);
          if (obsDate.getFullYear() === lastYear) {
            uniqueSpeciesLastYear.add(obs.species);
          }
        });

        this.totalUniqueSpeciesLastYear = uniqueSpeciesLastYear.size;
      });
  }

  calculateTotalObservationsAll() {
    this.observationService
      .getObservations()
      .subscribe((observations: ObservationDTO[]) => {
        this.totalObservationsAll = observations.length;
      });
  }

  calculateUniqueSpeciesAll() {
    this.observationService
      .getObservations()
      .subscribe((observations: ObservationDTO[]) => {
        const uniqueSpeciesAll = new Set<string>();

        observations.forEach((obs) => {
          uniqueSpeciesAll.add(obs.species);
        });

        this.totalUniqueSpeciesAll = uniqueSpeciesAll.size;
      });
  }

  calculateLastSpeciesAndDate() {
    this.observationService
      .getObservations()
      .subscribe((observations: ObservationDTO[]) => {
        observations.sort((a, b) => {
          const dateA = new Date(a.final_date);
          const dateB = new Date(b.final_date);
          return dateB.getTime() - dateA.getTime();
        });

        if (observations.length > 0) {
          this.lastSpecies = observations[0].species;
          const lastFinalDate = observations[0].final_date;
          this.lastFinalDate = this.datePipe.transform(
            lastFinalDate,
            'yyyy-MM-dd'
          );
        }
      });
  }

  redirectToSingleSpecies(speciesName: string) {
    this.router.navigate(['/species', speciesName]);
  }

  home(): void {
    this.router.navigateByUrl('');
  }

  species(): void {
    this.router.navigateByUrl('species');
  }

  explore(): void {
    this.router.navigateByUrl('explore');
  }

  mapa(): void {
    this.router.navigateByUrl('map');
  }

  logout(): void {
    this.authService.logout();
  }

  isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }
}
