import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {RecipientService} from '../../../../core/services/recipient.service';
import {Recipient} from '../../../../core/models/recipient.model';
import {recipientExternal} from '../../../../core/models/recipientExternal.model';

@Component({
  selector: 'app-add-recipient',
  templateUrl: './add-recipient.component.html',
  imports: [ReactiveFormsModule, RouterModule, CommonModule],
  standalone: true,
  styles: [`
    .bank-logo {
      max-height: 40px;
      object-fit: contain;
    }
  `]
})
export class AddRecipientComponent implements OnInit {
  recipientForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  bankInfo: { name: string; logo: string } | null = null;

  private banks = [
    { code: '230', name: 'CIH Banque', logo: 'https://seeklogo.com/images/C/cih-bank-logo-6FDAE8C2AE-seeklogo.com.png' },
    { code: '007', name: 'Attijariwafa Bank', logo: 'https://iconape.com/wp-content/files/ab/208549/png/208549.png' },
    { code: '157', name: 'Banque Centrale Populaire (BCP)', logo: 'https://th.bing.com/th/id/R.ed4e705541d3579ba34950a7a2cab300?rik=Wgn6%2bQOl0slXpg&pid=ImgRaw&r=0' },
    { code: '011', name: 'BMCE Bank', logo: 'https://www.mavignette.ma/mv/assets/images/bmce.png' },
    { code: '013', name: 'BMCI (BNP Paribas)', logo: 'https://th.bing.com/th/id/R.e2390c2453f7e129d5c076f8f033d3a7?rik=gvcb7sendJZSzw&riu=http%3a%2f%2fetige.ma%2fimages%2flogo-BMCI-02.png&ehk=Q0mD84AsbxLrJzBT%2fZfJ5zAT0CdT5G8y9s8I6esoNQo%3d&risl=&pid=ImgRaw&r=0' },
    { code: '022', name: 'SGMB (Société Générale)', logo: 'https://th.bing.com/th/id/R.cff23e8c280cc89f11a8545407c3dac0?rik=DqEEfQxqVqtLPw&riu=http%3a%2f%2fwww.maroc-performance.com%2fimg%2freferences%2f34_sgmb-logo.png&ehk=dz4Ak133eXLXBKaPbeX%2fhhn4E9ow3FxnnVVcEsbMG4U%3d&risl=&pid=ImgRaw&r=0' }
  ];


  constructor(
    private fb: FormBuilder,
    private recipientService: RecipientService,
    private router: Router
  ) {
    this.recipientForm = this.fb.group({
      isSameBank: [true, Validators.required],
      alias: ['', Validators.required],
      accountNumber: ['', Validators.required],
      rib: ['']
    });
  }

  ngOnInit(): void {
    this.recipientForm.get('isSameBank')?.valueChanges.subscribe((isSameBank) => {
      if (isSameBank) {
        this.recipientForm.get('accountNumber')?.setValidators([Validators.required]);
        this.recipientForm.get('rib')?.clearValidators();
      } else {
        this.recipientForm.get('rib')?.setValidators([Validators.required, Validators.pattern(/^\d{24}$/)]);
        this.recipientForm.get('accountNumber')?.clearValidators();
      }
      this.recipientForm.get('accountNumber')?.updateValueAndValidity();
      this.recipientForm.get('rib')?.updateValueAndValidity();
      this.bankInfo = null;
      this.error = null;
    });

    // Subscribe to RIB changes for bank lookup
    this.recipientForm.get('rib')?.valueChanges.subscribe((rib: string) => {
      this.bankInfo = null; // Reset bank info
      if (!this.recipientForm.get('isSameBank')?.value && rib && rib.length >= 3) {
        const bankCode = rib.substring(0, 3);
        if (/^\d{3}$/.test(bankCode)) {
          const bank = this.banks.find(b => b.code === bankCode);
          if (bank) {
            this.bankInfo = { name: bank.name, logo: bank.logo };
          } else {
            this.error = 'No bank found for this RIB code.';
          }
        }
      }
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
          alias: this.recipientForm.value.alias
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
          }
        });
      } else {
        const rib = this.recipientForm.value.rib;
        const bankCode = rib ? rib.substring(0, 3) : '';

        const externalRecipient: recipientExternal = {
          accountNumber: this.recipientForm.value.accountNumber || '',
          rib: rib,
          bankCode: bankCode,
          alias: this.recipientForm.value.alias
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
          }
        });
      }
    } else {
      if (!this.recipientForm.get('isSameBank')?.value && this.recipientForm.get('rib')?.invalid) {
        this.error = this.recipientForm.get('rib')?.errors?.['required'] ? 'RIB is required.' : 'RIB must be exactly 24 digits.';
      } else if (this.recipientForm.get('alias')?.invalid) {
        this.error = 'Recipient alias is required.';
      } else if (this.recipientForm.get('accountNumber')?.invalid) {
        this.error = 'Account number is required.';
      }
    }
  }
}
