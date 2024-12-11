import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigVideosComponent } from './config-videos.component';

describe('ConfigVideosComponent', () => {
  let component: ConfigVideosComponent;
  let fixture: ComponentFixture<ConfigVideosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigVideosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfigVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
