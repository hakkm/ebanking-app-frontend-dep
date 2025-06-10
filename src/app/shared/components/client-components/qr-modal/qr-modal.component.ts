import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './qr-modal.component.html',
  styleUrl: './qr-modal.component.css'
})
export class QrModalComponent {

  isOpen: boolean = true;
  @Input()
  title: string = 'QR Code Modal';
  


  @Output()
  close: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  submit: EventEmitter<void> = new EventEmitter<void>();



  closeModal() {
    this.close.emit();
    this.isOpen = false;

  }

  submitModal(){
    this.submit.emit();
    this.isOpen = false;
  }

}
