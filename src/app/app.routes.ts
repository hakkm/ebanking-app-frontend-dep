import { Routes } from '@angular/router';
import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { PublicLayoutComponent } from './shared/layouts/public-layout/public-layout.component';

import {HomeComponent} from './shared/components/home/home.component';

import {VirementComponent} from './shared/components/virement/virement.component';
import {TransactionsComponent} from './shared/components/transaction/transaction.component';
import {LoginComponent} from './shared/components/login/login.component';
import {RegisterComponent} from './shared/components/register/register.component';

import { authGuard } from './core/guards/auth.guard';
import { AddRecipientComponent } from './shared/components/add-recipient/add-recipient.component';
import { DashboardComponent } from './features/crypto/components/dashboard/dashboard.component';
import { RechargeComponent } from './shared/components/rechargetel/rechargetel.component';
import { AgentLoginComponent } from './shared/components/agent-login/agent-login.component';
import { AgentDashboardComponent } from './shared/components/agent-dashboard/agent-dashboard.component';

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
  {
    path: 'agent',
    children: [ 
      {path: 'login', component: AgentLoginComponent},
      {path: 'dashboard', component: AgentDashboardComponent}
    ]
  }
  ,
  {path: 'crypto', loadChildren: () => import('./features/crypto/crypto.module').then(m => m.CryptoModule)},
  { path: '**', redirectTo: 'home' }
];
