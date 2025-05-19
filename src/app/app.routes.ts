import { Routes } from '@angular/router';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import {HomeComponent} from './home/home.component';
import {TransactionComponent} from './transaction/transaction.component';
import {VirementComponent} from './virement/virement.component';
import {AddRecipientComponent} from '../add-recipient/add-recipient.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  // { path: '**', redirectTo: 'login' },
  {path: 'home',component : HomeComponent},
  { path: 'transactions/:id', component: TransactionComponent },
  {path :'virement' , component: VirementComponent},
  {path: 'add-recipient', component:AddRecipientComponent}
];
