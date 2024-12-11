import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackingViewsComponent } from './tracking-views.component';

describe('TrackingViewsComponent', () => {
  let component: TrackingViewsComponent;
  let fixture: ComponentFixture<TrackingViewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrackingViewsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrackingViewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
