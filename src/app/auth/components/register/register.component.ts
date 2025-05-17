// import { Component } from '@angular/core';
// import { Router } from '@angular/router';
// import { AuthService } from '../../services/auth.service';
// import { User } from '../../models/user.model';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { ToastrService } from 'ngx-toastr';
//
// @Component({
//   selector: 'app-register',
//   standalone: true,
//   imports: [CommonModule, FormsModule],
//   templateUrl: './register.component.html',
//   styleUrls: ['./register.component.css']
// })
// export class RegisterComponent {
//   user: User = { username: '', password: '', email: '', role: { name: 'CLIENT' } };
//   error: string | null = null;
//
//   constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) {}
//
//   onSubmit(): void {
//     this.authService.register(this.user).subscribe({
//       next: () => {
//         this.toastr.success('Registration successful! Please login.');
//         this.router.navigate(['/login']);
//       },
//       error: (err) => {
//         this.error = err.message;
//         this.toastr.error('Registration failed');
//       }
//     });
//   }
// }




import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  user: User = { username: '', password: '', email: '', role: { name: 'CLIENT' } };
  error: string | null = null;

  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) {}

  onSubmit(): void {
    this.error = null; // Clear previous errors
    this.authService.register(this.user).subscribe({
      next: () => {
        this.toastr.success('Registration successful! Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err.message;
        this.toastr.error(err.message);
      }
    });
  }
}
