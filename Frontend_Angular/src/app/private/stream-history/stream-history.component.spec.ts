import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamHistoryComponent } from './stream-history.component';

describe('StreamHistoryComponent', () => {
  let component: StreamHistoryComponent;
  let fixture: ComponentFixture<StreamHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StreamHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
