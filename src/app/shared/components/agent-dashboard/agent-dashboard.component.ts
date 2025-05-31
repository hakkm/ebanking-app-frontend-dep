import { Component } from '@angular/core';
import { AgentSidebarComponent } from "../agent-sidebar/agent-sidebar.component";
import { AgentHeaderComponent } from "../agent-header/agent-header.component";

@Component({
  selector: 'app-agent-dashboard',
  imports: [AgentSidebarComponent, AgentHeaderComponent],
  templateUrl: './agent-dashboard.component.html',
  
})
export class AgentDashboardComponent {

}
