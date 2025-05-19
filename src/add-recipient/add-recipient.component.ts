import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {RecipientService} from '../app/auth/services/recipient.service';
import {Recipient} from '../app/auth/models/recipient.model';

@Component({
  selector: 'app-add-recipient',
  templateUrl: './add-recipient.component.html',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  standalone: true,
})
export class AddRecipientComponent implements OnInit {
  recipientForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private recipientService: RecipientService,
    private router: Router
  ) {
    this.recipientForm = this.fb.group({
      isSameBank: [true, Validators.required],
      alias: [''],
      accountNumber: ['', Validators.required],
      rib: [''],
    });
  }

  ngOnInit(): void {
    this.recipientForm.get('isSameBank')?.valueChanges.subscribe((isSameBank) => {
      if (isSameBank) {
        this.recipientForm.get('accountNumber')?.setValidators(Validators.required);
        this.recipientForm.get('rib')?.clearValidators();
      } else {
        this.recipientForm.get('rib')?.setValidators(Validators.required);
        this.recipientForm.get('accountNumber')?.clearValidators();
      }
      this.recipientForm.get('accountNumber')?.updateValueAndValidity();
      this.recipientForm.get('rib')?.updateValueAndValidity();
    });
  }

  onSubmitRecipient(): void {
    if (this.recipientForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      this.error = null;

      const recipient: Recipient = {
        accountNumber: this.recipientForm.value.isSameBank
          ? this.recipientForm.value.accountNumber
          : this.recipientForm.value.rib,
        alias: this.recipientForm.value.alias,
      };

      console.log('Sending recipient:', JSON.stringify(recipient, null, 2));

      this.recipientService.createRecipient(recipient).subscribe({
        next: (response) => {
          console.log('Recipient created:', JSON.stringify(response, null, 2));
          this.isSubmitting = false;
          this.router.navigate(['/transfer']);
        },
        error: (err) => {
          console.error('Error:', JSON.stringify(err, null, 2));
          this.error = err.error?.message || 'Failed to add recipient. Please try again.';
          this.isSubmitting = false;
        },
      });
    }
  }
}
