import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Register3Component } from './register3.component';

describe('Register3Component', () => {
  let component: Register3Component;
  let fixture: ComponentFixture<Register3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Register3Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(Register3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
