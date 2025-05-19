import { Component } from '@angular/core';
import {NgClass, NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-crypto-dashboard',
  templateUrl: './crypto-dashboard.component.html',
  imports: [
    NgClass,
    NgForOf,
    NgIf
  ]
})
export class CryptoDashboardComponent {
}
