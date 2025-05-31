import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, output } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AccountExport } from '../../../core/models/account.export.model';
import { FormsModule } from '@angular/forms';
import { Account } from '../../../core/models/account.model';

@Component({
  selector: 'app-account-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './account-modal.component.html',
  styleUrl: './account-modal.component.css'
})
export class AccountModalComponent {
  

  @Input()
  title: string = "Create Account";

  @Input()
  submitButtonText: string = "Create";
  
  @Input()
  newAccount: AccountExport = { } as AccountExport;

  @Input()
  updatedAccount: Account = { } as Account;



  @Output() 
  actionAccountEvent: EventEmitter<AccountExport> = new EventEmitter<AccountExport>();
  @Output()
  closeModalEvent: EventEmitter<void> = new EventEmitter<void>();
  @Output()
  stopPropagationEvent: EventEmitter<MouseEvent> = new EventEmitter<MouseEvent>();

  button(){
    console.log(this.newAccount)
  }
  actionAccount() {
    this.actionAccountEvent.emit(this.newAccount);
  }
  stopPropagation($event: MouseEvent) {
    this.stopPropagationEvent.emit($event);
  }
  closeModal($event?: MouseEvent) {
    
    this.closeModalEvent.emit();
  }


}
