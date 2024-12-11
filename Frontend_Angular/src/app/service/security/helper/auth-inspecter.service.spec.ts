import { TestBed } from '@angular/core/testing';

import { AuthInspecterService } from './auth-inspecter.service';

describe('AuthInspecterService', () => {
  let service: AuthInspecterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthInspecterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
