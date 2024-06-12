import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  constructor(private router: Router) {}

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
}
