import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import Chart from 'chart.js/auto';
import * as L from 'leaflet';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { loadObservations } from '../../actions/observation.actions';
import { ObservationDTO } from '../../observation.dto';
import { AppState } from '../../reducers/app.reducers';
import { BirdImageService } from '../../services/bird-image.service';
import { ObservationService } from '../../services/observation.service';

@Component({
  selector: 'app-species-single',
  templateUrl: './species-single.component.html',
  styleUrls: ['./species-single.component.scss'],
  providers: [DatePipe],
})
export class SpeciesSingleComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  speciesName: string = '';
  speciesData: ObservationDTO[] = [];
  chartInstance: Chart | null = null;
  map: L.Map | null = null;
  birdImage: string | null = null;

  myControl = new FormControl();
  speciesList$!: Observable<string[]>;
  filteredOptions!: Observable<string[]>;

  displayedColumns: string[] = [
    'species',
    'amount',
    'age',
    'sex',
    'province',
    'location',
    'initial_date',
    'final_date',
    'observer',
  ];

  totalAmount = 0;
  totalUniqueObservations = 0;
  totalYears = 0;
  totalObservationsYear = 0;
  firstObservationDate: string | null = null;
  lastObservationDate: string | null = null;

  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private observationService: ObservationService,
    private birdImageService: BirdImageService,
    private datePipe: DatePipe,
    private store: Store<AppState>,
    private router: Router
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
          return of(Array.from(speciesSet));
        })
      );

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      switchMap((value) => this._filter(value))
    );

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.speciesName = params.get('name') || '';
          return this.observationService.getSpeciesByName(this.speciesName);
        })
      )
      .subscribe((data) => {
        this.speciesData = data;

        this.birdImageService.getBirdImage(this.speciesName).subscribe(
          (imageUrl) => {
            //console.log('Image URL:', imageUrl);
            this.birdImage = imageUrl;
            this.isLoading = false;
          },
          (error) => {
            console.error('Error fetching bird image', error);
          }
        );

        let earliestDate: Date | null = null;
        let latestDate: Date | null = null;
        const observationYears = new Set<number>();
        let observationsWithYear = 0;

        this.totalAmount = 0;
        this.totalUniqueObservations = this.speciesData.length;

        for (const observation of this.speciesData) {
          if (observation.amount !== null && !isNaN(observation.amount)) {
            this.totalAmount += observation.amount;
          }

          let validDate = false;
          if (observation.initial_date) {
            const initialDate = new Date(observation.initial_date);
            observationYears.add(initialDate.getFullYear());
            validDate = true;

            if (!earliestDate || initialDate < earliestDate) {
              earliestDate = initialDate;
            }
            if (!latestDate || initialDate > latestDate) {
              latestDate = initialDate;
            }
          }

          if (observation.final_date) {
            const finalDate = new Date(observation.final_date);
            observationYears.add(finalDate.getFullYear());
            validDate = true;

            if (!earliestDate || finalDate < earliestDate) {
              earliestDate = finalDate;
            }
            if (!latestDate || finalDate > latestDate) {
              latestDate = finalDate;
            }
          }

          if (validDate) {
            observationsWithYear++;
          }
        }

        this.totalYears = observationYears.size;

        if (this.totalYears > 0) {
          this.totalObservationsYear = parseFloat(
            (observationsWithYear / this.totalYears).toFixed(1)
          );
        } else {
          this.totalObservationsYear = 0;
        }

        this.firstObservationDate = earliestDate
          ? this.datePipe.transform(earliestDate, 'yyyy-MM-dd')
          : null;
        this.lastObservationDate = latestDate
          ? this.datePipe.transform(latestDate, 'yyyy-MM-dd')
          : null;

        this.updateChart();
        this.updateMap();
      });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    if (this.map) {
      this.map.remove();
    }
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
    this.router.navigate(['/species', speciesName]).then(() => {
      window.location.reload();
    });
  }

  updateChart(): void {
    const validObservations = this.speciesData.filter(
      (observation) =>
        observation.amount !== null && observation.initial_date !== null
    );

    const dataByYear: { [year: number]: number } = {};
    validObservations.forEach((observation) => {
      const year = new Date(observation.initial_date!).getFullYear();
      dataByYear[year] = (dataByYear[year] || 0) + observation.amount!;
    });

    const years = Object.keys(dataByYear).map((year) => parseInt(year));
    const amounts = Object.values(dataByYear);

    const canvas = document.getElementById('myChart') as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');

    if (ctx) {
      if (this.chartInstance) {
        this.chartInstance.destroy();
      }

      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: years,
          datasets: [
            {
              label: "Evolució del nombre d'exemplars registrats",
              data: amounts,
              borderColor: 'rgba(75, 192, 192, 1)',
              tension: 0.1,
              fill: false,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });
    }
  }

  initMap(): void {
    this.map = L.map('map').setView([41.3851, 2.1734], 8);

    L.Icon.Default.imagePath = 'assets/';

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.updateMap();
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
            `<b>Espècie:</b> ${observation.species}<br>
            <b>Localitat:</b> ${observation.location}<br>
            <b>Latitud:</b> ${observation.latitude}<br>
            <b>Longitud:</b> ${observation.longitude}`
          );
      }
    });
  }

  scrollTo(elementId: string) {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
  }
}
