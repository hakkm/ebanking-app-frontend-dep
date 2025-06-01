import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentSidebarComponent } from "../agent-sidebar/agent-sidebar.component";
import { AgentHeaderComponent } from "../agent-header/agent-header.component";
import { Chart, ChartConfiguration, registerables } from 'chart.js';

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
  imports: [AgentSidebarComponent, AgentHeaderComponent, CommonModule],
  templateUrl: './agent-dashboard.component.html',
  standalone: true
})
export class AgentDashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('transactionChart', { static: false }) transactionChartRef!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  // Sample data for recent users
  recentUsers: RecentUser[] = [
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

  ngAfterViewInit(): void {
    this.initializeChart();
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private initializeChart(): void {
    if (!this.transactionChartRef?.nativeElement) {
      return;
    }

    const ctx = this.transactionChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      return;
    }

    const chartConfig: ChartConfiguration = {
      type: 'line',
      data: {
        labels: ['May 17', 'May 18', 'May 19', 'May 20', 'May 21', 'May 22', 'May 23'],
        datasets: [
          {
            label: 'Internal Transactions',
            data: [45, 52, 48, 61, 65, 58, 75],
            borderColor: '#60a5fa', // Blue for internal
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
            data: [30, 35, 32, 42, 45, 38, 50],
            borderColor: '#c084fc', // Purple for external
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
            data: [90, 110, 95, 120, 130, 115, 125],
            borderColor: '#4ade80', // Green for total
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
              // drawBorder: false
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

  // Quick action methods
  createUser(): void {
    console.log('Create User clicked');
    // Implement navigation or modal logic here
    // Example: this.router.navigate(['/create-user']);
  }

  closeAccount(): void {
    console.log('Close Account clicked');
    // Implement close account logic here
  }

  viewTransactions(): void {
    console.log('View Transactions clicked');
    // Implement navigation to transactions page
    // Example: this.router.navigate(['/transactions']);
  }

  viewUsers(): void {
    console.log('View Users clicked');
    // Implement navigation to users page
    // Example: this.router.navigate(['/users']);
  }

  // TrackBy function for ngFor optimization
  trackByUserId(index: number, user: RecentUser): string {
    return user.id;
  }

  // Method to refresh dashboard data
  refreshDashboard(): void {
    console.log('Refreshing dashboard data...');
    // Implement data refresh logic here
    // This could involve calling services to fetch updated data
  }

  // Method to handle user card click
  onUserCardClick(user: RecentUser): void {
    console.log('User clicked:', user);
    // Implement navigation to user details
    // Example: this.router.navigate(['/user', user.id]);
  }
}
