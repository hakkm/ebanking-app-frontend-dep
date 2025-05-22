import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RecipientService } from '../../../core/services/recipient.service';
import { Recipient } from '../../../core/models/recipient.model';
import { recipientExternal } from '../../../core/models/recipientExternal.model';


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

      const isSameBank = this.recipientForm.value.isSameBank;

      if (isSameBank) {
        const recipient: Recipient = {
          accountNumber: this.recipientForm.value.accountNumber,
          alias: this.recipientForm.value.alias,
        };

        this.recipientService.createRecipient(recipient).subscribe({
          next: (response) => {
            console.log('Recipient created:', response);
            this.isSubmitting = false;
            this.router.navigate(['/transfer']);
          },
          error: (err) => {
            console.error('Error:', err);
            this.error = err.error?.message || 'Failed to add recipient.';
            this.isSubmitting = false;
          },
        });

      } else {
        const externalRecipient: recipientExternal = {
          accountNumber: this.recipientForm.value.accountNumber,
          rib: this.recipientForm.value.rib,
          bankCode: '230', // example static value, or make it a form field
          alias: this.recipientForm.value.alias,
        };

        this.recipientService.createExternalRecipient(externalRecipient).subscribe({
          next: (response) => {
            console.log('External recipient created:', response);
            this.isSubmitting = false;
            this.router.navigate(['/transfer']);
          },
          error: (err) => {
            console.error('Error:', err);
            this.error = err.error?.message || 'Failed to add external recipient.';
            this.isSubmitting = false;
          },
        });
      }
    }
  }

}
