// import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { AgentSidebarComponent } from "../agent-sidebar/agent-sidebar.component";
// import { AgentHeaderComponent } from "../agent-header/agent-header.component";
// import { Chart, ChartConfiguration, registerables } from 'chart.js';
//
// // Register Chart.js components
// Chart.register(...registerables);
//
// interface RecentUser {
//   id: string;
//   name: string;
//   email: string;
//   joinDate: string;
//   status: 'active' | 'inactive';
// }
//
// @Component({
//   selector: 'app-agent-dashboard',
//   imports: [CommonModule],
//   templateUrl: './agent-dashboard.component.html',
//   standalone: true
// })
// export class AgentDashboardComponent implements AfterViewInit, OnDestroy {
//   @ViewChild('transactionChart', { static: false }) transactionChartRef!: ElementRef<HTMLCanvasElement>;
//
//   private chart?: Chart;
//
//   // Sample data for recent users
//   recentUsers: RecentUser[] = [
//     {
//       id: '1',
//       name: 'John Doe',
//       email: 'john.doe@example.com',
//       joinDate: 'May 20, 2025',
//       status: 'active'
//     },
//     {
//       id: '2',
//       name: 'Jane Smith',
//       email: 'jane.smith@example.com',
//       joinDate: 'May 19, 2025',
//       status: 'active'
//     },
//     {
//       id: '3',
//       name: 'Mary Johnson',
//       email: 'mary.johnson@example.com',
//       joinDate: 'May 18, 2025',
//       status: 'active'
//     },
//     {
//       id: '4',
//       name: 'Robert Brown',
//       email: 'robert.brown@example.com',
//       joinDate: 'May 17, 2025',
//       status: 'active'
//     }
//   ];
//
//   ngAfterViewInit(): void {
//     this.initializeChart();
//   }
//
//   ngOnDestroy(): void {
//     if (this.chart) {
//       this.chart.destroy();
//     }
//   }
//
//   private initializeChart(): void {
//     if (!this.transactionChartRef?.nativeElement) {
//       return;
//     }
//
//     const ctx = this.transactionChartRef.nativeElement.getContext('2d');
//     if (!ctx) {
//       return;
//     }
//
//     const chartConfig: ChartConfiguration = {
//       type: 'line',
//       data: {
//         labels: ['May 17', 'May 18', 'May 19', 'May 20', 'May 21', 'May 22', 'May 23'],
//         datasets: [
//           {
//             label: 'Internal Transactions',
//             data: [45, 52, 48, 61, 65, 58, 75],
//             borderColor: '#60a5fa', // Blue for internal
//             backgroundColor: 'rgba(96, 165, 250, 0.1)',
//             fill: true,
//             tension: 0.4,
//             borderWidth: 3,
//             pointBackgroundColor: '#60a5fa',
//             pointBorderColor: '#1e3a8a',
//             pointBorderWidth: 2,
//             pointRadius: 5,
//             pointHoverRadius: 8
//           },
//           {
//             label: 'External Transactions',
//             data: [30, 35, 32, 42, 45, 38, 50],
//             borderColor: '#c084fc', // Purple for external
//             backgroundColor: 'rgba(192, 132, 252, 0.1)',
//             fill: true,
//             tension: 0.4,
//             borderWidth: 3,
//             pointBackgroundColor: '#c084fc',
//             pointBorderColor: '#581c87',
//             pointBorderWidth: 2,
//             pointRadius: 5,
//             pointHoverRadius: 8
//           },
//           {
//             label: 'Total Transactions',
//             data: [90, 110, 95, 120, 130, 115, 125],
//             borderColor: '#4ade80', // Green for total
//             backgroundColor: 'rgba(74, 222, 128, 0.1)',
//             fill: false,
//             tension: 0.4,
//             borderWidth: 3,
//             pointBackgroundColor: '#4ade80',
//             pointBorderColor: '#166534',
//             pointBorderWidth: 2,
//             pointRadius: 5,
//             pointHoverRadius: 8
//           }
//         ]
//       },
//       options: {
//         responsive: true,
//         maintainAspectRatio: false,
//         interaction: {
//           intersect: false,
//           mode: 'index'
//         },
//         plugins: {
//           legend: {
//             position: 'top',
//             labels: {
//               color: '#d1d5db',
//               font: {
//                 family: 'Inter',
//                 size: 12,
//                 weight: 'bold'
//               },
//               usePointStyle: true,
//               pointStyle: 'circle'
//             }
//           },
//           tooltip: {
//             backgroundColor: 'rgba(17, 24, 39, 0.95)',
//             titleColor: '#ffffff',
//             bodyColor: '#d1d5db',
//             borderColor: '#4b5563',
//             borderWidth: 1,
//             cornerRadius: 8,
//             displayColors: true,
//             titleFont: {
//               family: 'Inter'
//             }
//           }
//         },
//         scales: {
//           y: {
//             beginAtZero: true,
//             grid: {
//               color: 'rgba(75, 85, 99, 0.3)',
//               // drawBorder: false
//             },
//             ticks: {
//               color: '#9ca3af',
//               font: {
//                 family: 'Inter',
//                 size: 11
//               },
//               padding: 8
//             },
//             border: {
//               display: false
//             }
//           },
//           x: {
//             grid: {
//               display: false
//             },
//             ticks: {
//               color: '#9ca3af',
//               font: {
//                 family: 'Inter',
//                 size: 11
//               },
//               padding: 8
//             },
//             border: {
//               display: false
//             }
//           }
//         },
//         elements: {
//           point: {
//             hoverBorderWidth: 3
//           }
//         }
//       }
//     };
//
//     this.chart = new Chart(ctx, chartConfig);
//   }
//
//   // Quick action methods
//   createUser(): void {
//     console.log('Create User clicked');
//     // Implement navigation or modal logic here
//     // Example: this.router.navigate(['/create-user']);
//   }
//
//   closeAccount(): void {
//     console.log('Close Account clicked');
//     // Implement close account logic here
//   }
//
//   viewTransactions(): void {
//     console.log('View Transactions clicked');
//     // Implement navigation to transactions page
//     // Example: this.router.navigate(['/transactions']);
//   }
//
//   viewUsers(): void {
//     console.log('View Users clicked');
//     // Implement navigation to users page
//     // Example: this.router.navigate(['/users']);
//   }
//
//   // TrackBy function for ngFor optimization
//   trackByUserId(index: number, user: RecentUser): string {
//     return user.id;
//   }
//
//   // Method to refresh dashboard data
//   refreshDashboard(): void {
//     console.log('Refreshing dashboard data...');
//     // Implement data refresh logic here
//     // This could involve calling services to fetch updated data
//   }
//
//   // Method to handle user card click
//   onUserCardClick(user: RecentUser): void {
//     console.log('User clicked:', user);
//     // Implement navigation to user details
//     // Example: this.router.navigate(['/user', user.id]);
//   }
// }



import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { AgentService, DashboardStats, TransactionData } from '../../../../core/services/agent.service';
import { UserService } from '../../../../core/services/user.service';
import { Client } from '../../../../core/models/client.model';
import { catchError, forkJoin, of, map } from 'rxjs';

// Register Chart.js components
Chart.register(...registerables);

interface RecentUser {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-agent-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './agent-dashboard.component.html',
  standalone: true
})
export class AgentDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('transactionChart', { static: false }) transactionChartRef!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  // Dashboard stats
  dashboardStats: DashboardStats = {
    transactionsToday: 0,
    subscribedUsers: 0,
    internalTransactions: 0,
    externalTransactions: 0,
    targetProgress: 0
  };

  // Chart data
  transactionHistory: TransactionData[] = [];

  // Recent users data
  recentUsers: RecentUser[] = [];

  // Loading states
  isLoadingStats = true;
  isLoadingChart = true;
  isLoadingUsers = true;

  constructor(
    private agentService: AgentService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Chart will be initialized after data is loaded
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private loadDashboardData(): void {
    // Load all dashboard data in parallel
    forkJoin({
      stats: this.agentService.getDashboardStats().pipe(
        catchError(error => {
          console.error('Error loading dashboard stats:', error);
          return of(this.getDefaultStats());
        })
      ),
      transactionHistory: this.agentService.getTransactionHistory(7).pipe(
        catchError(error => {
          console.error('Error loading transaction history:', error);
          return of(this.getDefaultTransactionHistory());
        })
      ),
      recentUsers: this.agentService.getRecentUsers(4).pipe(
        catchError(error => {
          console.error('Error loading recent users:', error);
          // Fallback to UserService if AgentService fails
          return this.userService.getUsers().pipe(
            catchError(() => of([])),
            // Transform Client[] to RecentUser[] and take only the first 4
            map((users: Client[]) => users.slice(0, 4).map(user => this.transformClientToRecentUser(user)))
          );
        })
      )
    }).subscribe({
      next: (data) => {
        this.dashboardStats = data.stats;
        this.transactionHistory = data.transactionHistory;
        this.recentUsers = data.recentUsers;

        this.isLoadingStats = false;
        this.isLoadingChart = false;
        this.isLoadingUsers = false;

        // Initialize chart after data is loaded
        setTimeout(() => {
          this.initializeChart();
        }, 100);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.setDefaultData();
      }
    });
  }

  private transformClientToRecentUser(client: Client): RecentUser {
    return {
      id: client.id.toString(),
      name: client.username,
      email: client.email,
      joinDate: this.formatJoinDate(client.createTime),
      status: 'active' // You can implement logic to determine actual status
    };
  }

  private formatJoinDate(createTime: string): string {
    const date = new Date(createTime);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  private getDefaultStats(): DashboardStats {
    return {
      transactionsToday: 125,
      subscribedUsers: 500,
      internalTransactions: 75,
      externalTransactions: 50,
      targetProgress: 85
    };
  }

  private getDefaultTransactionHistory(): TransactionData[] {
    return [
      { date: 'May 17', internal: 45, external: 30, total: 90 },
      { date: 'May 18', internal: 52, external: 35, total: 110 },
      { date: 'May 19', internal: 48, external: 32, total: 95 },
      { date: 'May 20', internal: 61, external: 42, total: 120 },
      { date: 'May 21', internal: 65, external: 45, total: 130 },
      { date: 'May 22', internal: 58, external: 38, total: 115 },
      { date: 'May 23', internal: 75, external: 50, total: 125 }
    ];
  }

  private setDefaultData(): void {
    this.dashboardStats = this.getDefaultStats();
    this.transactionHistory = this.getDefaultTransactionHistory();
    this.recentUsers = [
      {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        joinDate: 'May 20, 2025',
        status: 'active'
      },
      {
        id: '2',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        joinDate: 'May 19, 2025',
        status: 'active'
      },
      {
        id: '3',
        name: 'Mary Johnson',
        email: 'mary.johnson@example.com',
        joinDate: 'May 18, 2025',
        status: 'active'
      },
      {
        id: '4',
        name: 'Robert Brown',
        email: 'robert.brown@example.com',
        joinDate: 'May 17, 2025',
        status: 'active'
      }
    ];

    this.isLoadingStats = false;
    this.isLoadingChart = false;
    this.isLoadingUsers = false;

    setTimeout(() => {
      this.initializeChart();
    }, 100);
  }

  private initializeChart(): void {
    if (!this.transactionChartRef?.nativeElement || this.transactionHistory.length === 0) {
      return;
    }

    const ctx = this.transactionChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = this.transactionHistory.map(data => data.date);
    const internalData = this.transactionHistory.map(data => data.internal);
    const externalData = this.transactionHistory.map(data => data.external);
    const totalData = this.transactionHistory.map(data => data.total);

    const chartConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Internal Transactions',
            data: internalData,
            borderColor: '#60a5fa',
            backgroundColor: 'rgba(96, 165, 250, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#60a5fa',
            pointBorderColor: '#1e3a8a',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8
          },
          {
            label: 'External Transactions',
            data: externalData,
            borderColor: '#c084fc',
            backgroundColor: 'rgba(192, 132, 252, 0.1)',
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#c084fc',
            pointBorderColor: '#581c87',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8
          },
          {
            label: 'Total Transactions',
            data: totalData,
            borderColor: '#4ade80',
            backgroundColor: 'rgba(74, 222, 128, 0.1)',
            fill: false,
            tension: 0.4,
            borderWidth: 3,
            pointBackgroundColor: '#4ade80',
            pointBorderColor: '#166534',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#d1d5db',
              font: {
                family: 'Inter',
                size: 12,
                weight: 'bold'
              },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(17, 24, 39, 0.95)',
            titleColor: '#ffffff',
            bodyColor: '#d1d5db',
            borderColor: '#4b5563',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            titleFont: {
              family: 'Inter'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(75, 85, 99, 0.3)',
            },
            ticks: {
              color: '#9ca3af',
              font: {
                family: 'Inter',
                size: 11
              },
              padding: 8
            },
            border: {
              display: false
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#9ca3af',
              font: {
                family: 'Inter',
                size: 11
              },
              padding: 8
            },
            border: {
              display: false
            }
          }
        },
        elements: {
          point: {
            hoverBorderWidth: 3
          }
        }
      }
    };

    this.chart = new Chart(ctx, chartConfig);
  }

  // Refresh dashboard data
  refreshDashboard(): void {
    this.isLoadingStats = true;
    this.isLoadingChart = true;
    this.isLoadingUsers = true;
    this.loadDashboardData();
  }

  // Quick action methods - now using router links
  // These methods are kept for any additional logic you might want to add

  // Method to handle user card click
  onUserCardClick(user: RecentUser): void {
    console.log('User clicked:', user);
    // You can add navigation logic here if needed
    // Example: this.router.navigate(['/agent/user-profile', user.id]);
  }

  // TrackBy function for ngFor optimization
  trackByUserId(index: number, user: RecentUser): string {
    return user.id;
  }

  // Helper method to get percentage for progress bar
  getTargetProgressStyle(): string {
    return `width: ${this.dashboardStats.targetProgress}%`;
  }

  // Method to determine if internal transactions are due
  getInternalTransactionsBadge(): { text: string; class: string } {
    // You can implement logic to determine if transactions are due
    const daysSinceLastUpdate = 3; // This should come from your data

    if (daysSinceLastUpdate > 5) {
      return { text: 'Overdue', class: 'bg-red-600/20 text-red-400 border-red-600/30' };
    } else if (daysSinceLastUpdate > 2) {
      return { text: `Due in ${5 - daysSinceLastUpdate} days`, class: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30' };
    }

    return { text: 'Up to date', class: 'bg-green-600/20 text-green-400 border-green-600/30' };
  }

  // Method to get last updated time for external transactions
  getLastUpdatedTime(): string {
    // This should come from your actual data
    const lastUpdate = new Date();
    lastUpdate.setMinutes(lastUpdate.getMinutes() - 5);

    const minutes = Math.floor((new Date().getTime() - lastUpdate.getTime()) / (1000 * 60));

    if (minutes === 0) return 'Just now';
    if (minutes === 1) return '1 min ago';
    return `${minutes} mins ago`;
  }
}
