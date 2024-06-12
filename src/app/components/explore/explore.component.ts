import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import Chart from 'chart.js/auto';
import * as L from 'leaflet';
import { Observable, of } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { loadObservations } from '../../actions/observation.actions';
import { ObservationDTO } from '../../observation.dto';
import { AppState } from '../../reducers/app.reducers';
import { ObservationService } from '../../services/observation.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss'],
  providers: [DatePipe],
})
export class ExploreComponent implements OnInit, OnDestroy {
  controlSpecies = new FormControl();
  controlLocation = new FormControl();
  controlAmount = new FormControl();
  controlYear = new FormControl();
  controlAge = new FormControl();
  controlProvince = new FormControl();
  controlSex = new FormControl();

  dateRangeForm: FormGroup;

  speciesList$!: Observable<string[]>;
  locationList$!: Observable<string[]>;
  amountList$!: Observable<string[]>;
  ageList$!: Observable<string[]>;
  provinceList$!: Observable<string[]>;
  sexList$!: Observable<string[]>;
  yearList$: Observable<string[]> = of([]);

  filteredOptionsSpecies!: Observable<string[]>;
  filteredOptionsLocation!: Observable<string[]>;
  filteredOptionsAmount!: Observable<string[]>;
  filteredOptionsYear!: Observable<string[]>;
  filteredOptionsAge!: Observable<string[]>;
  filteredOptionsProvince!: Observable<string[]>;
  filteredOptionsSex!: Observable<string[]>;

  chartInstance: Chart | null = null;
  map: L.Map | null = null;
  speciesData: ObservationDTO[] = [];

  displayedColumns: string[] = [
    'species',
    'amount',
    'age',
    'sex',
    'province',
    'location',
    'latitude',
    'longitude',
    'initial_date',
    'final_date',
    'observer',
  ];

  noResults: boolean = false;
  noSearch: boolean = true;

  constructor(
    private observationService: ObservationService,
    private datePipe: DatePipe,
    private store: Store<AppState>,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.dateRangeForm = this.fb.group({
      start: [null],
      end: [null],
    });
  }

  ngOnInit(): void {
    this.store.dispatch(loadObservations());

    this.speciesList$ = this.extractUniqueValues('species');
    this.locationList$ = this.extractUniqueValues('location');
    this.amountList$ = this.extractUniqueValues('amount');
    this.ageList$ = this.extractUniqueValues('age');
    this.provinceList$ = this.extractUniqueValues('province');
    this.sexList$ = this.extractUniqueValues('sex');

    this.calculateYears().subscribe((years) => {
      this.yearList$ = of(years);
      this.filteredOptionsYear = this.createFilteredOptions(
        this.controlYear,
        this.yearList$
      );
    });

    this.filteredOptionsSpecies = this.createFilteredOptions(
      this.controlSpecies,
      this.speciesList$
    );
    this.filteredOptionsLocation = this.createFilteredOptions(
      this.controlLocation,
      this.locationList$
    );
    this.filteredOptionsAmount = this.createFilteredOptions(
      this.controlAmount,
      this.amountList$
    );
    this.filteredOptionsAge = this.createFilteredOptions(
      this.controlAge,
      this.ageList$
    );
    this.filteredOptionsProvince = this.createFilteredOptions(
      this.controlProvince,
      this.provinceList$
    );
    this.filteredOptionsSex = this.createFilteredOptions(
      this.controlSex,
      this.sexList$
    );
  }

  ngOnDestroy(): void {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
    if (this.map) {
      this.map.remove();
    }
  }

  private extractUniqueValues(field: string): Observable<string[]> {
    return this.store
      .select((state) => state.observations)
      .pipe(
        switchMap((observations) => {
          const uniqueValues = new Set<string>();
          observations.forEach((observation) => {
            const value = (observation as any)[field];
            if (value !== null && value !== undefined) {
              uniqueValues.add(String(value));
            }
          });
          const uniqueValuesArray = Array.from(uniqueValues);
          if (field === 'amount') {
            uniqueValuesArray.sort((a, b) => Number(a) - Number(b));
          }

          return of(uniqueValuesArray);
        })
      );
  }

  private createFilteredOptions(
    control: FormControl,
    list$: Observable<string[]>
  ): Observable<string[]> {
    return control.valueChanges.pipe(
      startWith(''),
      switchMap((value) => {
        const filterValue = value ? value.toLowerCase() : '';
        return list$.pipe(
          map((list) =>
            list.filter((item) => item.toLowerCase().includes(filterValue))
          )
        );
      })
    );
  }

  calculateYears(): Observable<string[]> {
    return this.store
      .select((state) => state.observations)
      .pipe(
        switchMap((observations) => {
          const yearsSet = new Set<number>();

          observations.forEach((observation) => {
            if (observation.initial_date) {
              const initialYear = new Date(
                observation.initial_date
              ).getFullYear();
              yearsSet.add(initialYear);
            }
            if (observation.final_date) {
              const finalYear = new Date(observation.final_date).getFullYear();
              yearsSet.add(finalYear);
            }
          });

          const yearsArray = Array.from(yearsSet).sort((a, b) => a - b);
          return of(yearsArray.map(String));
        })
      );
  }

  onSearch(): void {
    const selectedSpecies = this.controlSpecies.value;
    const selectedLocation = this.controlLocation.value;
    const selectedAmount = this.controlAmount.value;
    const selectedYear = this.controlYear.value;
    const selectedAge = this.controlAge.value;
    const selectedProvince = this.controlProvince.value;
    const selectedSex = this.controlSex.value;
    const startDate = this.dateRangeForm.get('start')?.value;
    const endDate = this.dateRangeForm.get('end')?.value;

    const filters = {
      species: selectedSpecies,
      location: selectedLocation,
      amount: selectedAmount,
      year: selectedYear,
      age: selectedAge,
      province: selectedProvince,
      sex: selectedSex,
      startDate: startDate
        ? this.datePipe.transform(startDate, 'yyyy-MM-dd')
        : null,
      endDate: endDate ? this.datePipe.transform(endDate, 'yyyy-MM-dd') : null,
    };

    this.observationService
      .getFilteredObservations(filters)
      .subscribe((data) => {
        this.speciesData = data;
        this.updateChart();
        this.noResults = this.speciesData.length === 0;
        this.updateMap();
      });

    this.noSearch = false;

    if (!this.map) {
      this.initMap();
    }
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
        this.chartInstance = null;
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
    setTimeout(() => {
      this.map = L.map('exp-map').setView([41.3851, 2.1734], 8);

      L.Icon.Default.imagePath = 'assets/';

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      this.updateMap();
    }, 0);
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
}
