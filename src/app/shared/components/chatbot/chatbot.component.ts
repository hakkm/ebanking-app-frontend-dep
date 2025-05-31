import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ChatRequest, ChatService} from '../../../core/services/chat.service';

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: string;
}

type Language = 'fr' | 'en' | 'ar' | 'ma';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styles: [`
    /* Custom scrollbar for messages */
    ::-webkit-scrollbar {
      width: 6px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(31, 41, 55, 0.8);
      border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb {
      background: rgba(79, 70, 229, 0.4);
      border-radius: 10px;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(99, 102, 241, 0.6);
    }

    /* Smooth transitions */
    .transition-all {
      transition-property: all;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      transition-duration: 300ms;
    }

    /* Bounce animation for typing indicator */
    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }

    .animate-bounce {
      animation: bounce 1.4s infinite;
    }
  `]
})
export class ChatbotComponent implements AfterViewChecked {
  @Input() isOpen = false;
  @Output() closeRequest = new EventEmitter<void>();
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  selectedLanguage: Language = 'fr';
  currentMessage = '';
  messages: ChatMessage[] = [];
  isTyping = false;
  private sessionId: string | null = null;
  isConnecting = false;

  constructor(private chatService: ChatService) {}


  ngOnInit() {
    this.initializeSession();
  }


  private initializeSession() {
    this.isConnecting = true;
    this.chatService.startNewSession().subscribe({
      next: (sessionId) => {
        this.sessionId = sessionId;
        this.chatService.setSessionId(sessionId);
        this.isConnecting = false;
      },
      error: (error) => {
        console.error('Failed to start session:', error);
        this.isConnecting = false;
      }
    });
  }



  sendMessage() {
    if (!this.currentMessage.trim() || this.isTyping || !this.sessionId) return;

    // Add user message
    const userMessage: ChatMessage = {
      text: this.currentMessage,
      isUser: true,
      timestamp: this.getCurrentTime()
    };
    this.messages.push(userMessage);

    const messageToSend = this.currentMessage;
    this.currentMessage = '';
    this.isTyping = true;

    // Send to backend
    const request: ChatRequest = {
      memoryId: this.sessionId,
      message: messageToSend,
      language: this.selectedLanguage
    };

    this.chatService.sendMessage(request).subscribe({
      next: (response) => {
        const botMessage: ChatMessage = {
          text: response,
          isUser: false,
          timestamp: this.getCurrentTime()
        };
        this.messages.push(botMessage);
        this.isTyping = false;
      },
      error: (error) => {
        console.error('Chat error:', error);
        const errorMessage: ChatMessage = {
          text: this.getErrorMessage(),
          isUser: false,
          timestamp: this.getCurrentTime()
        };
        this.messages.push(errorMessage);
        this.isTyping = false;
      }
    });
  }

  private welcomeMessages = {
    fr: "Bonjour ! Je suis votre assistant virtuel Atlas Banking. Comment puis-je vous aider aujourd'hui ?",
    en: "Hello! I'm your Atlas Banking virtual assistant. How can I help you today?",
    ar: "مرحباً! أنا مساعدك الافتراضي في بنك أطلس. كيف يمكنني مساعدتك اليوم؟",
    ma: "أهلاً! أنا المساعد الافتراضي ديال بنك أطلس. كيفاش نقدر نعاونك اليوم؟"
  };

  private placeholders = {
    fr: "Tapez votre message...",
    en: "Type your message...",
    ar: "اكتب رسالتك...",
    ma: "كتب الرسالة ديالك..."
  };


  private getErrorMessage(): string {
    const errorMessages = {
      fr: "Désolé, une erreur s'est produite. Veuillez réessayer.",
      en: "Sorry, an error occurred. Please try again.",
      ar: "آسف، حدث خطأ. يرجى المحاولة مرة أخرى.",
      ma: "سماح ليا، وقع خطأ. عاود جرب."
    };
    return errorMessages[this.selectedLanguage];
  }


  getConnectingText(): string {
    const connecting = {
      fr: 'Connexion...',
      en: 'Connecting...',
      ar: 'جاري الاتصال...',
      ma: 'كنتصل...'
    };

    return connecting[this.selectedLanguage];

  }

  getOnlineText(): string {
    const online = {
      fr: 'En ligne',
      en: 'Online',
      ar: 'متصل',
      ma: 'متصل'
    };

    return online[this.selectedLanguage];

  }

  getTypingText(): string {
    const typing = {
      fr: 'Atlas tape...',
      en: 'Atlas is typing...',
      ar: 'أطلس يكتب...',
      ma: 'أطلس كيكتب...'
    };
    return typing[this.selectedLanguage];
  }




  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  closeModal(event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    // End session when closing
    if (this.sessionId) {
      this.chatService.endSession(this.sessionId).subscribe();
    }

    this.closeRequest.emit();
  }
  onLanguageChange() {
    // Clear messages when language changes
    this.messages = [];
  }

  getWelcomeMessage(): string {
    return this.welcomeMessages[this.selectedLanguage];
  }

  getInputPlaceholder(): string {
    return this.placeholders[this.selectedLanguage];
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }
}
