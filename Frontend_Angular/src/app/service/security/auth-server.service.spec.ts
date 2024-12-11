import { TestBed } from '@angular/core/testing';

import { AuthServerService } from './auth-server.service';

describe('AuthServerService', () => {
  let service: AuthServerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthServerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
