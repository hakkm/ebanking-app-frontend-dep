import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { QRCodeComponent } from 'angularx-qrcode'; 
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AccountService } from '../../../../core/services/account.service';
import { QrModalComponent } from "../qr-modal/qr-modal.component";
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-qr-transfer',
  imports: [CommonModule, FormsModule, ReactiveFormsModule , QrModalComponent],
  templateUrl: './qr-transfer.component.html',
  styleUrl: './qr-transfer.component.css'
})
export class QrTransferComponent implements OnInit {
  activeTab: 'send' | 'receive' | 'history' = 'send';
  accounts: any[] = []; // Placeholder for account data
  receiveForm: FormGroup;
  isLoading: boolean = false;
  message: string = '';
  error: string = '';
  amount: number = 0;
  selectedAccountId: string = '';
  userId!: number;
  selectedAccount: string = ''; 
  


  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private authService: AuthService,
    private http: HttpClient
    
  ) {
    this.receiveForm = this.fb.group({
      accountId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]]
    });
  }
  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe((data)=>{
      this.userId = data.id || 0;

    });     // this.userService.getAccounts().subscribe({
    console.log(this.authService.getCurrentUser())
    this.accountService.getAccounts().subscribe({
      next: (data) => {
        console.log('Comptes récupérés:', data);
        this.accounts = data as any[]; 
      }
      ,
      error: (error) => {
        console.error('Erreur lors de la récupération des comptes:', error);
        this.error = 'Impossible de charger les comptes. Veuillez réessayer plus tard.';
        setTimeout(() => (this.error = ''), 3000);
      }
    });
    
  }

  generateQRCode()  {
    const body = {
      accountId: this.selectedAccountId,
      amount: this.amount
    }
    console.log('Génération du QR Code avec les données:', body);

    this.http.post(environment.apiUrl + "/client/qr-code", body, {headers: {"Authorization": `Bearer ${localStorage.getItem('auth_token')}`}}).subscribe((data)=>{
      console.log('QR Code data:', data);
    },
    (error) => {
      console.error('Erreur lors de la génération du QR Code:', error);
      this.error = 'Erreur lors de la génération du QR Code. Veuillez réessayer plus tard.';
    })
  
  }

}
