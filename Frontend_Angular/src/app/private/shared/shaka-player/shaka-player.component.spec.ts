import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShakaPlayerComponent } from './shaka-player.component';

describe('ShakaPlayerComponent', () => {
  let component: ShakaPlayerComponent;
  let fixture: ComponentFixture<ShakaPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShakaPlayerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShakaPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
