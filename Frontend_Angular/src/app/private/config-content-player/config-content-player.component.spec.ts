import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigContentPlayerComponent } from './config-content-player.component';

describe('ConfigContentPlayerComponent', () => {
  let component: ConfigContentPlayerComponent;
  let fixture: ComponentFixture<ConfigContentPlayerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigContentPlayerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigContentPlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
