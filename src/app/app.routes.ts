import {Routes} from '@angular/router';

export const routes: Routes = [
  {path: 'crypto', loadChildren: () => import('./features/crypto/crypto.module').then(m => m.CryptoModule)},
  {path: '', redirectTo: 'crypto', pathMatch: 'full'},
];
