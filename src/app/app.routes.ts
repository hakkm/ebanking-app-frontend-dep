import { Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import {HomeComponent} from './home/home.component';
import {TransactionComponent} from './transaction/transaction.component';
import {RechargeComponent} from './Rechargetel/rechargetel/rechargetel.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // { path: '**', redirectTo: 'login' },
  {path: 'home',component : HomeComponent},
  { path: 'transactions/:id', component: TransactionComponent },
  {
    path: 'recharge',
    loadComponent: () => import('./Rechargetel/rechargetel/rechargetel.component').then(m => m.RechargeComponent)
  },

];
