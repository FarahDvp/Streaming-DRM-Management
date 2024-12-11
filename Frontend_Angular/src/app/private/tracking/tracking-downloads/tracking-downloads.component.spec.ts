import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackingDownloadsComponent } from './tracking-downloads.component';

describe('TrackingDownloadsComponent', () => {
  let component: TrackingDownloadsComponent;
  let fixture: ComponentFixture<TrackingDownloadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackingDownloadsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrackingDownloadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
