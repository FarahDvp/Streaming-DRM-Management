import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamDownloadsComponent } from './stream-downloads.component';

describe('StreamDownloadsComponent', () => {
  let component: StreamDownloadsComponent;
  let fixture: ComponentFixture<StreamDownloadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamDownloadsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StreamDownloadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
