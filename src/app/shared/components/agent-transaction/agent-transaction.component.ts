import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../../core/services/transaction.service';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AgentService } from '../../../core/services/agent.service';


@Component({
  selector: 'app-agent-transaction',
  imports: [CommonModule, FormsModule],
  templateUrl: './agent-transaction.component.html',
  styleUrl: './agent-transaction.component.css'
})
export class AgentTransactionComponent implements OnInit {



  transactions: any = [];
  filteredTransactions: any[] = [];
  selectedTransaction: any;
  filterType: string = 'user';
  filterDate: string = '';
  isAscending: boolean = true;

  constructor(
    private transactionService: TransactionService,
    private agentService: AgentService
  ) {}

  ngOnInit() {
    // this.transactionService.getTransactions(1).subscribe(
    //   (data: any[]) => {
    //     this.transactions = data;
    //     this.filteredTransactions = data;
    //   }, 
    //   (error) => {
    //     console.error('Error fetching transactions:', error);
    //   }
    // );
    this.transactions = [
      { id: 1, date: '2025-05-23', amount: 50.00, type: 'Transfer', status: 'Completed', user: 'John Doe', description: 'Transfer to savings' },
      { id: 2, date: '2025-05-22', amount: 30.00, type: 'Payment', status: 'Pending', user: 'John Doe', description: 'Utility bill payment' },
      { id: 3, date: '2025-05-21', amount: 25.00, type: 'Deposit', status: 'Completed', user: 'John Doe', description: 'Salary deposit' },
      { id: 4, date: '2025-05-20', amount: 75.00, type: 'Transfer', status: 'Completed', user: 'Jane Smith', description: 'Transfer to checking' },
      { id: 5, date: '2025-05-19', amount: 100.00, type: 'Payment', status: 'Pending', user: 'Mary Johnson', description: 'Rent payment' },
  ];

    this.agentService.getTransactions().subscribe(
      (data) => {
        console.log(data)
        this.transactions = data;
        console.log('Transactions inside:', this.transactions);
        // this.filteredTransactions = data;
      },
      (error) => {
        console.error('Error fetching transactions:', error);
      }
    );
    this.filteredTransactions = [...this.transactions];

    this.applyFilter();
  }

  applyFilter() {
    let filtered = [...this.transactions];
    if (this.filterType === 'user') {
      filtered = filtered.filter(t => t.user === 'John Doe'); // Filter for specific user
    }
    if (this.filterDate) {
      filtered = filtered.filter(t => t.date.startsWith(this.filterDate));
    }
    this.filteredTransactions = filtered;
  }

  sortTransactions() {
    this.filteredTransactions.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return this.isAscending ? dateA - dateB : dateB - dateA;
    });
    this.isAscending = !this.isAscending;
  }

  openModal(transaction: any) {
    this.selectedTransaction = { ...transaction };
    const modal = document.getElementById('transactionModal');
    if (modal) modal.classList.remove('hidden');
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

  reportTransaction() {
    console.log('Reporting transaction:', this.selectedTransaction);
    alert('Transaction reported! (Implementation pending)');
    this.closeModal();
  }
}