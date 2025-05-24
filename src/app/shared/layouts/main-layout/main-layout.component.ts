import { Component, OnInit, HostListener } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import {ChatbotComponent} from '../../components/chatbot/chatbot.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CommonModule, ChatbotComponent],
  template: `
    <div class="flex h-screen bg-gray-950 overflow-hidden">
      <!-- Backdrop for mobile sidebar (appears when sidebar is open on mobile) -->
      <div
        *ngIf="isSidebarOpen && isMobileView"
        class="fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity duration-300"
        (click)="toggleSidebar()"
      ></div>

      <!-- Sidebar - note the conditional classes for mobile view -->
      <div
        [ngClass]="{
          'fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out': isMobileView,
          '-translate-x-full': isMobileView && !isSidebarOpen,
          'translate-x-0': !isMobileView || (isMobileView && isSidebarOpen)
        }"
      >
        <app-sidebar></app-sidebar>
      </div>

      <!-- Main content area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Top navbar with toggle button -->
        <header class="bg-gray-900 border-b border-gray-800 shadow-md z-10">
          <div class="px-4 py-3 flex items-center justify-between">
            <!-- Sidebar toggle button (only visible on mobile) -->
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

            <!-- App title (only shown when sidebar is collapsed on mobile) -->
            <h1 *ngIf="isMobileView" class="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Atlas Banking
            </h1>

            <!-- Empty div to push user menu to the right -->
            <div class="flex items-center space-x-3">
              <!-- Notification bell -->
              <button class="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none transition duration-200 relative">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span class="absolute top-0 right-0 h-2 w-2 rounded-full bg-indigo-500"></span>
              </button>
            </div>
          </div>
        </header>

        <!-- Main content with page outlet -->
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
  styles: [`
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
  `]
})
export class MainLayoutComponent implements OnInit {
  isSidebarOpen = true;
  isMobileView = false;
  isChatbotOpen = false;


  ngOnInit(): void {
    // Check initial screen size
    this.checkScreenSize();
  }

  /**
   * Listen to window resize events to adjust sidebar visibility
   */
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  /**
   * Check the screen size and set the sidebar visibility accordingly
   */
  checkScreenSize(): void {
    this.isMobileView = window.innerWidth < 768;

    // Automatically close sidebar on mobile view
    if (this.isMobileView) {
      this.isSidebarOpen = false;
    } else {
      this.isSidebarOpen = true;
    }
  }

  /**
   * Toggle the sidebar visibility
   */
  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
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
