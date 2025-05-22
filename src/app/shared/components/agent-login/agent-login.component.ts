import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-agent-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './agent-login.component.html',
  styleUrl: './agent-login.component.css'
})
export class AgentLoginComponent {
  email: string = '';
  password: string = '';
  error: string | null = null;
  isLoading: boolean = false;
  rememberMe: boolean = false;
  hidePassword: boolean = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    this.error = null;
    this.isLoading = true;


    if (!this.validateEmail(this.email)) {
      this.error = 'Please enter a valid email address';
      this.isLoading = false;
      return;
    }

    // TODO: Add api part here
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

}
