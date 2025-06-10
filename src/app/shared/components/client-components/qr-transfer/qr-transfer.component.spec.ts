import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrTransferComponent } from './qr-transfer.component';

describe('QrTransferComponent', () => {
  let component: QrTransferComponent;
  let fixture: ComponentFixture<QrTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrTransferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QrTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
