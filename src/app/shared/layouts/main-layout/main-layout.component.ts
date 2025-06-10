import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';
import { NotificationService } from '../../../core/services/Notification.service';
import { AccountService } from '../../../core/services/account.service';
import { Account } from '../../../core/models/account.model';
import {ChatbotComponent} from '../../components/chatbot/chatbot.component';

export interface NotificationWithAccount {
  id: number;
  message: string;
  date?: string;
  isRead?: boolean;
  accountId: number;
  maskedAccountNumber?: string; // Add this property
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule, ChatbotComponent],
  template: `
    <div class="flex h-screen bg-gray-950 overflow-hidden">
      <!-- Backdrop for mobile sidebar -->
      <div
        *ngIf="isSidebarOpen && isMobileView"
        class="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300"
        (click)="toggleSidebar()"
      ></div>

      <!-- Sidebar -->
      <div
        [ngClass]="{
          'fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out': isMobileView,
          '-translate-x-full': isMobileView && !isSidebarOpen,
          'translate-x-0': !isMobileView || (isMobileView && isSidebarOpen)
        }"
      >
        <app-sidebar></app-sidebar>
      </div>

      <!-- Main content -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <header class="bg-gray-900 border-b border-gray-800 shadow-md z-10">
          <div class="px-4 py-3 flex items-center justify-between">
            <button
              *ngIf="isMobileView"
              (click)="toggleSidebar()"
              class="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none transition duration-200"
            >
              <svg *ngIf="!isSidebarOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg *ngIf="isSidebarOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h1 *ngIf="isMobileView" class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Atlas Banking
            </h1>

            <div class="flex items-center justify-end space-x-3 relative ml-auto">
              <button (click)="toggleNotifications()" class="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none transition duration-200 relative">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span *ngIf="notifications.length > 0" class="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                  {{ notifications.length }}
                </span>
              </button>

              <!-- Notifications dropdown -->
              <div *ngIf="showNotifications" class="absolute right-0 top-full mt-2 w-80 bg-white text-black rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto border">
                <div *ngIf="notifications.length === 0" class="p-4 text-sm text-center text-gray-500">Aucune notification</div>
                <div *ngFor="let notif of notifications; let i = index" class="p-3 border-b border-gray-200 text-sm hover:bg-gray-100 last:border-b-0 flex justify-between items-start">
                  <div class="flex-1">
                    <div class="font-medium text-gray-900">{{ notif.message }}</div>
                    <div *ngIf="notif.maskedAccountNumber" class="text-xs text-gray-500 mt-1">
                      Compte: {{ notif.maskedAccountNumber }}
                    </div>
                    <div *ngIf="!notif.maskedAccountNumber && notif.accountId" class="text-xs text-gray-400 mt-1">
                      Chargement du compte...
                    </div>
                  </div>
                  <button
                    (click)="confirmDelete(i)"
                    class="ml-2 text-gray-400 hover:text-red-500 transition-colors duration-200 p-1 flex-shrink-0"
                    title="Supprimer la notification"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Modal de confirmation -->
              <div *ngIf="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="cancelDelete()">
                <div class="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl" (click)="$event.stopPropagation()">
                  <div class="flex items-center mb-4">
                    <div class="flex-shrink-0">
                      <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <h3 class="text-lg font-medium text-gray-900">Confirmer la suppression</h3>
                    </div>
                  </div>
                  <div class="mb-4">
                    <p class="text-sm text-gray-600">
                      Êtes-vous sûr de vouloir supprimer cette notification ? Cette action ne peut pas être annulée.
                    </p>
                  </div>
                  <div class="flex justify-end space-x-3">
                    <button
                      (click)="cancelDelete()"
                      class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                    >
                      Annuler
                    </button>
                    <button
                      (click)="executeDelete()"
                      class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Chatbot component -->
      <app-chatbot
        [isOpen]="isChatbotOpen"
        (closeRequest)="closeChatbot()"
      ></app-chatbot>
      <!-- FLOATING CHATBOT BUTTON -->
      <button *ngIf="!isChatbotOpen"
              (click)="toggleChatbot()"
              class="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 z-40 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
      }

      main {
        scrollbar-width: thin;
        scrollbar-color: rgba(107, 114, 128, 0.5) rgba(17, 24, 39, 1);
      }

      main::-webkit-scrollbar {
        width: 8px;
      }

      main::-webkit-scrollbar-track {
        background: rgba(17, 24, 39, 1);
      }

      main::-webkit-scrollbar-thumb {
        background-color: rgba(107, 114, 128, 0.5);
        border-radius: 20px;
        border: 2px solid rgba(17, 24, 39, 1);
      }

      /* Style pour le dropdown des notifications */
      .relative {
        position: relative;
      }
    `
  ]
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  isSidebarOpen = true;
  isMobileView = false;
  isChatbotOpen = false;

  currentUser: User | null = null;
  notifications: NotificationWithAccount[] = [];
  showNotifications = false;
  error: string | null = null;

  // Variables pour la confirmation de suppression
  showDeleteConfirm = false;
  deleteIndex: number | null = null;

  private userSubscription: Subscription | null = null;
  private notificationSubscription: Subscription | null = null;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadUserData();
  }

  // Fixed method to load account information asynchronously
  loadAccountInfo(notification: NotificationWithAccount): void {
    if (notification.accountId && !notification.maskedAccountNumber) {
      this.accountService.getAccount(notification.accountId).subscribe({
        next: (account: Account) => {
          notification.maskedAccountNumber = account.maskedAccountNumber;
        },
        error: (err) => {
          console.error(`Error loading account ${notification.accountId}:`, err);
          notification.maskedAccountNumber = 'Compte introuvable';
        }
      });
    }
  }

  loadUserData(): void {
    this.userSubscription = this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
        if (!user) {
          this.authService.getCurrentUser().subscribe();
        } else {
          this.loadNotifications(user.username);
        }
      },
      error: (err) => {
        this.error = 'Failed to load user information.';
        console.error('Error loading user:', err);
      }
    });
  }

  loadNotifications(username: string): void {
    this.notificationSubscription = this.notificationService.getNotifications(username).subscribe({
      next: (notifs) => {
        this.notifications = notifs.map(notif => ({
          ...notif,
          maskedAccountNumber: undefined // Initialize as undefined
        }));

        // Load account information for each notification
        this.notifications.forEach(notif => {
          if (notif.accountId) {
            this.loadAccountInfo(notif);
          }
        });
      },
      error: (err) => {
        console.error('Error loading notifications:', err);
      }
    });
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  confirmDelete(index: number): void {
    this.deleteIndex = index;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deleteIndex = null;
  }

  executeDelete(): void {
    if (this.deleteIndex !== null) {
      this.deleteNotification(this.deleteIndex);
    }
    this.cancelDelete();
  }

  deleteNotification(index: number): void {
    const notification = this.notifications[index];
    if (notification && notification.id) {
      this.notificationService.deleteNotification(notification.id).subscribe({
        next: () => {
          this.notifications.splice(index, 1);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la notification:', err);
        }
      });
    } else {
      this.notifications.splice(index, 1);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isMobileView = window.innerWidth < 768;
    this.isSidebarOpen = !this.isMobileView;
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  ngOnDestroy(): void {
    this.userSubscription?.unsubscribe();
    this.notificationSubscription?.unsubscribe();
  }


  /**
   * Toggle the chatbot visibility
   */
  toggleChatbot(): void {
    this.isChatbotOpen = !this.isChatbotOpen;
  }

  /**
   * Close the chatbot
   */
  closeChatbot(): void {
    this.isChatbotOpen = false;
  }
}
