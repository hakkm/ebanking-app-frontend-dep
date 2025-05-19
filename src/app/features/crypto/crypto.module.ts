import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CryptoDashboardComponent } from './components/crypto-dashboard/crypto-dashboard.component';

const routes: Routes = [
  { path: '', component: CryptoDashboardComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class CryptoModule { }
