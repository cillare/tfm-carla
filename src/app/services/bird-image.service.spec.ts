import { TestBed } from '@angular/core/testing';

import { BirdImageService } from './bird-image.service';

describe('BirdImageService', () => {
  let service: BirdImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BirdImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
