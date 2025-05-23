import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AgentService } from '../../../core/services/agent.service';


@Component({
  selector: 'app-agent-login',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './agent-login.component.html',
  styleUrl: './agent-login.component.css'
})
export class AgentLoginComponent {
  name: string = '';
  password: string = '';
  error: string | undefined = undefined;
  isLoading: boolean = false;
  rememberMe: boolean = false;
  hidePassword: boolean = true;

  constructor(
    private agentService : AgentService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  onSubmit(): void {
    this.error = undefined;
    this.isLoading = true;




    // TODO: Add api part here
    const names = {
      name: this.name
    }


    this.agentService.login({name: this.name, password: this.password}).subscribe({
      next: () => {
        this.toastr.success('Login successful!', '', {
          positionClass: 'toast-bottom-right',
          progressBar: true,
          timeOut: 3000
        });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error = err.message || 'Authentication failed. Please try again.';
        
        console.log(this.error);
        this.toastr.error(this.error, '', {
          positionClass: 'toast-bottom-right',
          progressBar: true,
          timeOut: 5000
        });
        this.isLoading = false;
      }
    });
  }


}
