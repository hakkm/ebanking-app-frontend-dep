import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../core/services/user.service';
import { Client } from '../../../core/models/client.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-agent-users',
  imports: [CommonModule, RouterLink],
  templateUrl: './agent-users.component.html',
  
})
export class AgentUsersComponent implements OnInit {
  
  users: Client[] = [];
  renderedUsers: Client[] = [];
  startIndex: number = 0;
  endIndex: number = 10;
  currentPage: number = 1;

  constructor(
    private userService: UserService
  ) { }
  
  
  ngOnInit(): void {
    
    this.userService.getUsers().subscribe((response: any) => {
      console.log('Users:', response);
      this.users = response;
      this.renderedUsers = [...this.users].slice(this.startIndex, this.endIndex); 
    },
      (error: any) => {
        console.error('Error fetching users:', error);
      }
    );


  }



  onNextPage() {
    this.startIndex += 10;
    this.endIndex += 10;
    this.renderedUsers = [...this.users].slice(this.startIndex, this.endIndex);
    this.currentPage++;
  }
  onPreviousPage() {
    this.startIndex -= 10;
    this.endIndex -= 10;
    this.renderedUsers = [...this.users].slice(this.startIndex, this.endIndex);
    this.currentPage--;
  }

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