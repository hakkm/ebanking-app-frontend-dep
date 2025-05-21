import {Routes} from '@angular/router';
import {MainLayoutComponent} from './main-layout/main-layout.component';
import {PublicLayoutComponent} from './public-layout/public-layout.component';
import {authGuard} from './auth.guard';
import {HomeComponent} from './home/home.component';
import {AddRecipientComponent} from './add-recipient/add-recipient.component';
import {VirementComponent} from './virement/virement.component';
import {TransactionsComponent} from './transaction/transaction.component';
import {LoginComponent} from './auth/components/login/login.component';
import {RegisterComponent} from './auth/components/register/register.component';
import {RechargeComponent} from './Rechargetel/rechargetel/rechargetel.component';
import { DashboardComponent } from './features/crypto/components/dashboard/dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'transactions', component:TransactionsComponent},
      { path: 'virement', component: VirementComponent },
      { path: 'add-recipient', component: AddRecipientComponent },
      { path: 'recharge', component: RechargeComponent },
      { path: 'crypto',  component: DashboardComponent},

      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
  },
  {path: 'crypto', loadChildren: () => import('./features/crypto/crypto.module').then(m => m.CryptoModule)},
  { path: '**', redirectTo: 'home' }
];
