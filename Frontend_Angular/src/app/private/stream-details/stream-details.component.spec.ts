import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamDetailsComponent } from './stream-details.component';

describe('StreamDetailsComponent', () => {
  let component: StreamDetailsComponent;
  let fixture: ComponentFixture<StreamDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StreamDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
