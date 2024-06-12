import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './auth/components/login/login.component';
import { ExploreComponent } from './components/explore/explore.component';
import { HomeComponent } from './components/home/home.component';
import { MapaComponent } from './components/mapa/mapa.component';
import { ObservationFormComponent } from './components/observation-form/observation-form.component';
import { ObservationsComponent } from './components/observations/observations.component';
import { SpeciesSingleComponent } from './components/species-single/species-single.component';
import { SpeciesComponent } from './components/species/species.component';

import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'species',
    component: SpeciesComponent,
  },
  {
    path: 'explore',
    component: ExploreComponent,
  },
  {
    path: 'map',
    component: MapaComponent,
  },
  {
    path: 'species/:name',
    component: SpeciesSingleComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'observations',
    component: ObservationsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'observation-form',
    component: ObservationFormComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'observation-form/:id',
    component: ObservationFormComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
