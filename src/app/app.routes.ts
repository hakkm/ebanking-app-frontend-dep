import { MainLayoutComponent } from './shared/layouts/main-layout/main-layout.component';
import { PublicLayoutComponent } from './shared/layouts/public-layout/public-layout.component';



import {BudgetAlertComponent} from './Gestionbudget/gestionbudget/gestionbudget.component';
import { AgentLoginComponent } from './shared/components/agent-components/agent-login/agent-login.component';
import { AgentLayoutComponent } from './shared/layouts/agent-layout/agent-layout.component';
import { AgentDashboardComponent } from './shared/components/agent-components/agent-dashboard/agent-dashboard.component';
import { AgentUsersComponent } from './shared/components/agent-components/agent-users/agent-users.component';
import {
  AgentTransactionComponent
} from './shared/components/agent-components/agent-transaction/agent-transaction.component';
import { AgentUserProfileComponent } from './shared/components/agent-components/agent-user-profile/agent-user-profile.component';
import {authGuard} from './core/guards/auth.guard';
import {accountGuard} from './core/guards/account.guard';
import {HomeComponent} from './shared/components/client-components/home/home.component';
import {TransactionsComponent} from './shared/components/client-components/transaction/transaction.component';
import {VirementComponent} from './shared/components/client-components/virement/virement.component';
import {RechargeComponent} from './shared/components/client-components/rechargetel/rechargetel.component';
import {AddRecipientComponent} from './shared/components/client-components/add-recipient/add-recipient.component';
import {DashboardComponent} from './features/crypto/components/dashboard/dashboard.component';
import {LoginComponent} from './shared/components/client-components/login/login.component';
import {RegisterComponent} from './shared/components/client-components/register/register.component';
import {ReferralComponent} from './shared/components/client-components/referral/referral.component';
import { AgentAccountsComponent } from './shared/components/agent-accounts/agent-accounts.component';
import { Routes } from '@angular/router';

export const routes: Routes = [

  {path: 'agent/login', component: AgentLoginComponent},
  {
    path: 'agent',
    component: AgentLayoutComponent,
    children: [

      {path: 'dashboard', component: AgentDashboardComponent},
      {path: 'manage-users', component: AgentUsersComponent},
      {path: 'transactions', component: AgentTransactionComponent},
      {path: 'accounts', component: AgentAccountsComponent},
      {path: 'user-profile/:id', component: AgentUserProfileComponent},
    ]
  }
  ,
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
      {
        path: 'crypto',
        component: DashboardComponent
      },
      { path: 'BudgetAlert', component: BudgetAlertComponent },
      { path: 'referral', component: ReferralComponent },

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
