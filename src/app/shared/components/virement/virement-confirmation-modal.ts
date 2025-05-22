import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

export interface ConfirmationData {
  title: string;
  type: 'internal' | 'external';
  fromAccount: string;
  toRecipient: string;
  amount: number;
  currency: string;
  reason?: string;
  fees?: number;
}

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isVisible"
      class="fixed inset-0 z-50 overflow-y-auto"
      [@fadeIn]="isVisible"
      (click)="onBackdropClick($event)"
    >
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"></div>

      <!-- Modal -->
      <div class="flex min-h-screen items-center justify-center p-4">
        <div
          class="relative w-full max-w-2xl transform rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 shadow-2xl transition-all duration-300"
          [@slideIn]="isVisible"
        >
          <!-- Modal Header -->
          <div class="relative px-6 pt-6 pb-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mr-3 border border-green-800/30">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-white">{{ data?.title || 'Confirmation' }}</h3>
                  <p class="text-sm text-gray-400">Vérifiez les détails avant de confirmer</p>
                </div>
              </div>
              <button
                (click)="onCancel()"
                class="p-2 rounded-full hover:bg-gray-700/50 transition-colors duration-200 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Modal Content -->
          <div class="px-6 pb-6 grid gap-4 grid-cols-1 md:grid-cols-2">
            <!-- Transfer Type Badge -->
            <div class="mb-4 md:col-span-2">
          <span
            class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
            [ngClass]="{
              'bg-blue-900/30 text-blue-400 border border-blue-800/30': data?.type === 'internal',
              'bg-purple-900/30 text-purple-400 border border-purple-800/30': data?.type === 'external'
            }"
          >
            <div
              class="w-2 h-2 rounded-full mr-2"
              [ngClass]="{
                'bg-blue-400': data?.type === 'internal',
                'bg-purple-400': data?.type === 'external'
              }"
            ></div>
            {{ data?.type === 'internal' ? 'Virement Interne' : 'Virement Externe' }}
          </span>
            </div>

            <!-- Transaction Details -->
            <div class="grid gap-4 grid-cols-1 md:grid-cols-2 md:col-span-2">
              <!-- From Account -->
              <div class="p-4 bg-gray-800/40 rounded-xl border border-gray-700/50">
                <div class="flex items-center">
                  <div class="w-10 h-10 rounded-full bg-orange-600/20 flex items-center justify-center mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-400">Compte source</p>
                    <p class="text-white font-medium">{{ data?.fromAccount || 'N/A' }}</p>
                  </div>
                </div>
              </div>

              <!-- To Recipient -->
              <div class="p-4 bg-gray-800/40 rounded-xl border border-gray-700/50">
                <div class="flex items-center">
                  <div
                    class="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                    [ngClass]="{
                  'bg-blue-600/20': data?.type === 'internal',
                  'bg-purple-600/20': data?.type === 'external'
                }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
                         [ngClass]="{
                       'text-blue-400': data?.type === 'internal',
                       'text-purple-400': data?.type === 'external'
                     }"
                         fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path *ngIf="data?.type === 'internal'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      <path *ngIf="data?.type === 'external'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <div>
                    <p class="text-sm text-gray-400">Bénéficiaire</p>
                    <p class="text-white font-medium">{{ data?.toRecipient || 'N/A' }}</p>
                  </div>
                </div>
              </div>

              <!-- Transfer Arrow -->
              <div class="flex justify-center items-center md:col-start-1 md:col-end-3 md:-mt-2 md:-mb-2">
                <div class="w-8 h-8 rounded-full bg-green-600/20 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Amount Section -->
            <div class="p-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-800/30 md:col-span-2">
              <div class="text-center">
                <p class="text-sm text-gray-400 mb-1">Montant du virement</p>
                <p class="text-3xl font-bold text-green-400 mb-2">
                  {{ formatAmount(data?.amount || 0) }} {{ data?.currency || '' }}
                </p>
                <div *ngIf="data && data.fees && data.fees > 0" class="text-sm text-gray-400">
                  + {{ formatAmount(data.fees) }} {{ data.currency }} (frais)
                </div>
              </div>
            </div>

            <!-- Reason -->
            <div *ngIf="data && data.reason" class="p-4 bg-gray-800/40 rounded-xl border border-gray-700/50 md:col-span-2">
              <p class="text-sm text-gray-400 mb-1">Motif</p>
              <p class="text-white">{{ data.reason }}</p>
            </div>

            <!-- Security Notice -->
            <div class="p-4 bg-amber-900/20 border border-amber-800/30 rounded-xl md:col-span-2">
              <div class="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-400 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p class="text-amber-400 text-sm font-medium">Attention</p>
                  <p class="text-amber-200/80 text-xs mt-1">
                    Cette transaction ne peut pas être annulée une fois confirmée. Vérifiez attentivement les détails.
                  </p>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="grid grid-cols-2 gap-3 md:col-span-2">
              <button
                (click)="onCancel()"
                class="px-4 py-3 bg-gray-700/50 text-gray-300 rounded-xl hover:bg-gray-600/50 transition-all duration-200 font-medium border border-gray-600/50"
              >
                Annuler
              </button>
              <button
                (click)="onConfirm()"
                [disabled]="isProcessing"
                class="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg *ngIf="!isProcessing" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg *ngIf="isProcessing" class="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ isProcessing ? 'Traitement...' : 'Confirmer le Virement' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  animations: [
    trigger('fadeIn', [
      state('in', style({ opacity: 1 })),
      transition('void => *', [
        style({ opacity: 0 }),
        animate(300)
      ]),
      transition('* => void', [
        animate(300, style({ opacity: 0 }))
      ])
    ]),
    trigger('slideIn', [
      state('in', style({ transform: 'scale(1)', opacity: 1 })),
      transition('void => *', [
        style({ transform: 'scale(0.9)', opacity: 0 }),
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ]),
      transition('* => void', [
        animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
          style({ transform: 'scale(0.9)', opacity: 0 }))
      ])
    ])
  ]
})
export class ConfirmationModalComponent implements OnInit, OnDestroy {
  @Input() isVisible: boolean = false;
  @Input() data: ConfirmationData | null = null;
  @Input() isProcessing: boolean = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  ngOnInit() {
    if (this.isVisible) {
      document.body.style.overflow = 'hidden';
    }
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
  }

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
    document.body.style.overflow = '';
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}
