import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaceVerificationComponent } from './face-verification.component';

describe('FaceVerificationComponent', () => {
  let component: FaceVerificationComponent;
  let fixture: ComponentFixture<FaceVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaceVerificationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaceVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
