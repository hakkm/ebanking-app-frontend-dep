import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionbudgetComponent } from './gestionbudget.component';

describe('GestionbudgetComponent', () => {
  let component: GestionbudgetComponent;
  let fixture: ComponentFixture<GestionbudgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionbudgetComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionbudgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
