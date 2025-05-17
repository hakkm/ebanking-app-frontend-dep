import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { TokenService } from '../../../core/services/token.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  error: string | null = null;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  onSubmit(): void {
    this.error = null; // Clear previous errors
    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.tokenService.setCredentials(this.username, this.password);
        this.toastr.success('Login successful!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.message;
        this.toastr.error(err.message);
      }
    });
  }
}
