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
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { QrCodeService } from '../../../../core/services/qr-code.service';
import { Toast, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-qr-transfer',
  imports: [CommonModule, FormsModule, ReactiveFormsModule , QrModalComponent, ZXingScannerModule, QRCodeComponent],
  templateUrl: './qr-transfer.component.html',
  styleUrl: './qr-transfer.component.css'
})
export class QrTransferComponent implements OnInit {
  activeTab: 'Create QR' | 'Scan to pay' | 'history' = 'Create QR';
  accounts: any[] = []; 
  receiveForm: FormGroup;
  isLoading: boolean = false;
  message: string = '';
  error: string = '';
  amount: number = 0;
  selectedAccountId: string = '';
  userId!: number;
  selectedAccount: string = ''; 
  isQrCodeShown: boolean = false;
  QRCode: string = '';

  isScanning: boolean = false;
  hasPermission: boolean = false;
  currentDevice: MediaDeviceInfo | undefined  = undefined;
  scanResult: string | null = null;
  availableDevices: MediaDeviceInfo[] = [];

  scannedQRCodeData: any
  

  isPayModalShown: boolean = false
  

  selectedFromAccountId: string = '';


  history: any

  isHistoryQRCodeShown: boolean = false;
  historyClickedQRCode: string = '';



  constructor(
    private fb: FormBuilder,
    private accountService: AccountService,
    private authService: AuthService,
    private http: HttpClient,
    private qrCodeService: QrCodeService,
    private toastr: ToastrService
    
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
      amount: this.amount,
      
    }
    console.log('Génération du QR Code avec les données:', body);

    this.qrCodeService.generateQRCode(body).subscribe((data)=>{
      console.log('QR Code data:', data);
      this.QRCode = data as string; 
      this.isQrCodeShown = true;
      console.log('QR Code généré avec succès:', this.QRCode);
    },
    (error) => {
      console.error('Erreur lors de la génération du QR Code:', error);
      this.error = 'Erreur lors de la génération du QR Code. Veuillez réessayer plus tard.';
    })
  
  }

  closeQRCodeModal() {
    this.isQrCodeShown = false;
  }




  startScanning(): void {
    this.isScanning = true;
    this.scanResult = null; 
    console.log("Starting scan...");
  }

  stopScanning(): void {
    this.isScanning = false;
    this.currentDevice = undefined; 
  }

  onScanSuccess(result: string): void {
    console.log("result is : " + result)
    this.scanResult = result;
    this.getQRCodeInfo(result);
    this.isScanning = false; 
    this.isPayModalShown = true; 
    this.stopScanning(); 
  }

  onPermissionResponse(permission: boolean): void {
    this.hasPermission = permission;
    if (!permission) {
      console.warn('Camera access was denied.');
    }

  }
    onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    
    this.currentDevice = devices.find(device => device.label.toLowerCase().includes('back')) || devices[0] || null;
  }

  getQRCodeInfo(code: string){
    this.qrCodeService.getQRCode(code).subscribe({
      next: (data) => {
        console.log('QR Code récupéré:', data);
        this.scannedQRCodeData = data;

        
        
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du QR Code:', error);
        this.error = 'Impossible de charger le QR Code. Veuillez réessayer plus tard.';
        setTimeout(() => (this.error = ''), 3000);
      }
    });
    
  }

  payViaQRCode(){
    const body = {

      code: this.scanResult,
      accountId: this.selectedFromAccountId

    }
    console.log(body)

    this.qrCodeService.payViaQRCode(body).subscribe((data)=>{
      console.log(data)
      this.isPayModalShown = false;
      this.toastr.success('Paiement effectué avec succès!', '', {
        positionClass: 'toast-bottom-right',
        progressBar: true,
        timeOut: 3000
      });
      this.scanResult = null;
      this.isQrCodeShown = false;
      this.QRCode = '';
      this.selectedFromAccountId = '';
      this.scannedQRCodeData = null;
      this.isScanning = false;
      this.currentDevice = undefined;
      this.availableDevices = [];
      
    },
    (error) => {
      console.log(error)

      this.toastr.error('Erreur lors du paiement. Veuillez réessayer plus tard.', '', {
        positionClass: 'toast-bottom-right',
        progressBar: true,
        timeOut: 5000
      });
    }
  )
  }


  fetchHistory(){
    this.qrCodeService.getAllQRCodes().subscribe({
      next: (data) => {
        console.log('Historique des QR Codes récupéré:', data);
        // Traitez les données de l'historique ici
        this.history = data as any[]; // Assurez-vous que le type correspond à vos données
      },
      error: (error) => {
        console.error('Erreur lors de la récupération de l\'historique des QR Codes:', error);
        this.error = 'Impossible de charger l\'historique. Veuillez réessayer plus tard.';
        setTimeout(() => (this.error = ''), 3000);
      }
    });

  }

  showQrCode(code: string){
    this.isHistoryQRCodeShown = true;
    this.historyClickedQRCode = code;

  }
  hideQrCode(){
    this.isHistoryQRCodeShown = false;
    this.historyClickedQRCode = '';
  }
  onHistoryTabClick() {
    this.activeTab = 'history';
    this.fetchHistory(); 

  }

}
