import { Component } from '@angular/core';
import { AgentSidebarComponent } from "../../components/agent-sidebar/agent-sidebar.component";
import { AgentHeaderComponent } from "../../components/agent-header/agent-header.component";
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-agent-layout',
  imports: [AgentSidebarComponent, AgentHeaderComponent, RouterOutlet],
  templateUrl: './agent-layout.component.html',
  
})
export class AgentLayoutComponent {

}
