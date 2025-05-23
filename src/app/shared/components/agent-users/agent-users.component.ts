import { Component } from '@angular/core';

@Component({
  selector: 'app-agent-users',
  imports: [],
  templateUrl: './agent-users.component.html',
  styleUrl: './agent-users.component.css'
})
export class AgentUsersComponent {
  
  openModal(email: string) {
    const modal = document.getElementById('transactionModal');
    if (modal) {
      modal.classList.remove('hidden');
      // MY TASK: fetch this from backend
    }
  }

  closeModal(event?: Event) {
    const modal = document.getElementById('transactionModal');
    if (modal && (!event || event.target === modal)) {
      modal.classList.add('hidden');
    }
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}