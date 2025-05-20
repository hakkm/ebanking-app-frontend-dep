import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet],
  template: `
    <div class="h-screen">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: []
})
export class PublicLayoutComponent {}
