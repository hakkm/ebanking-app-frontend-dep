import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-agent-sidebar',
  imports: [RouterLink],
  templateUrl: './agent-sidebar.component.html',
  styleUrl: './agent-sidebar.component.css'
})
export class AgentSidebarComponent {

  constructor(private router: Router) {}


  logout(){

    
    this.router.navigate(['/agent/login']);
    //TODO: remove the token from the session, after implementing the security part
  }

}
