import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import {ChatRequest, ChatService} from '../../../core/services/chat.service';

interface ChatMessage {
  text: string;
  isUser: boolean;
  timestamp: string;
}

interface EnhancedChatMessage extends ChatMessage {
  type: 'text' | 'financial_data' | 'transaction_list' | 'error';
  metadata?: any;
}

type Language = 'fr' | 'en' | 'ar' | 'ma';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownModule],
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

    /* Markdown styling */
    .markdown-content {
      line-height: 1.6;
    }

    .markdown-content h1,
    .markdown-content h2,
    .markdown-content h3 {
      margin-top: 1rem;
      margin-bottom: 0.5rem;
      font-weight: bold;
    }

    .markdown-content h1 { font-size: 1.25rem; }
    .markdown-content h2 { font-size: 1.125rem; }
    .markdown-content h3 { font-size: 1rem; }

    .markdown-content p {
      margin-bottom: 0.75rem;
    }

    .markdown-content ul,
    .markdown-content ol {
      margin-bottom: 0.75rem;
      padding-left: 1.5rem;
    }

    .markdown-content li {
      margin-bottom: 0.25rem;
    }

    .markdown-content strong {
      font-weight: 600;
    }

    .markdown-content em {
      font-style: italic;
    }

    .markdown-content code {
      background-color: rgba(0, 0, 0, 0.1);
      padding: 0.125rem 0.25rem;
      border-radius: 0.25rem;
      font-family: 'Courier New', monospace;
      font-size: 0.875rem;
    }

    .markdown-content pre {
      background-color: rgba(0, 0, 0, 0.1);
      padding: 0.75rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 0.75rem 0;
    }

    .markdown-content blockquote {
      border-left: 4px solid rgba(79, 70, 229, 0.4);
      padding-left: 1rem;
      margin: 0.75rem 0;
      font-style: italic;
    }

    /* Message type specific markdown styling */
    .financial-data .markdown-content {
      background: rgba(59, 130, 246, 0.1);
      border-radius: 0.5rem;
      padding: 0.75rem;
    }

    .transaction-list .markdown-content {
      background: rgba(139, 92, 246, 0.1);
      border-radius: 0.5rem;
      padding: 0.75rem;
    }

    .error-message .markdown-content {
      background: rgba(239, 68, 68, 0.1);
      border-radius: 0.5rem;
      padding: 0.75rem;
    }

    /* Dark theme adjustments */
    .dark .markdown-content code {
      background-color: rgba(255, 255, 255, 0.1);
      color: #e5e7eb;
    }

    .dark .markdown-content pre {
      background-color: rgba(255, 255, 255, 0.1);
    }
  `]
})

export class ChatbotComponent implements AfterViewChecked {
  @Input() isOpen = false;
  @Output() closeRequest = new EventEmitter<void>();
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  selectedLanguage: Language = 'fr';
  currentMessage = '';
  messages: EnhancedChatMessage[] = [];
  isTyping = false;
  private sessionId: string | null = null;
  isConnecting = false;

  constructor(private chatService: ChatService, private sanitizer: DomSanitizer) {}


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
    const userMessage: EnhancedChatMessage = {
      text: this.currentMessage,
      isUser: true,
      timestamp: this.getCurrentTime(),
      type: 'text',
      metadata: {}
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
        const botMessage = this.parseStructuredResponse(response);
        this.messages.push(botMessage);
        this.isTyping = false;
      },
      error: (error) => {
        console.error('Chat error:', error);
        const errorMessage: EnhancedChatMessage = {
          text: this.getErrorMessage(),
          isUser: false,
          timestamp: this.getCurrentTime(),
          type: 'error',
          metadata: {}
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

  private parseStructuredResponse(response: string): EnhancedChatMessage {
    let messageType: 'text' | 'financial_data' | 'transaction_list' | 'error' = 'text';
    let metadata: any = {};

    // Detect financial data
    if (response.includes('$') && (response.includes('Account') || response.includes('Balance') || response.includes('Solde'))) {
      messageType = 'financial_data';

      // Extract balance amounts
      const balanceMatches = response.match(/\$[\d,]+\.?\d*/g);
      if (balanceMatches) {
        metadata.amounts = balanceMatches;
      }
    }

    // Detect transaction lists
    else if (response.includes('transactions') || response.includes('Recent') ||
      response.includes('dernières') || response.includes('معاملات')) {
      messageType = 'transaction_list';

      // Count number of transactions mentioned
      const transactionLines = response.split('\n').filter(line =>
        line.includes('$') || line.includes('ID:') || line.includes('-')
      );
      metadata.transactionCount = transactionLines.length;
    }

    // Detect errors (Java exceptions, error messages)
    else if (response.includes('Exception') || response.includes('Error') ||
      response.includes('SQLException') || response.includes('NullPointer') ||
      response.toLowerCase().includes('sorry') && response.includes('try again')) {
      messageType = 'error';
    }

    return {
      text: response,
      isUser: false,
      timestamp: this.getCurrentTime(),
      type: messageType,
      metadata
    };
  }


  getQuickSuggestions() {
    const suggestions = {
      fr: [
        { label: '💰 Mes comptes', message: 'Affiche mes comptes' },
        { label: '📊 Mes transactions', message: 'Affiche mes dernières transactions' },
        { label: '💡 Conseils financiers', message: 'Donne-moi des conseils financiers' },
        { label: '📈 Analyse de dépenses', message: 'Analyse mes dépenses du mois dernier' }
      ],
      en: [
        { label: '💰 My accounts', message: 'Show my accounts' },
        { label: '📊 My transactions', message: 'Show my recent transactions' },
        { label: '💡 Financial advice', message: 'Give me financial advice' },
        { label: '📈 Spending analysis', message: 'Analyze my spending last month' }
      ],
      ar: [
        { label: '💰 حساباتي', message: 'اعرض حساباتي' },
        { label: '📊 معاملاتي', message: 'اعرض آخر معاملاتي' },
        { label: '💡 نصائح مالية', message: 'أعطني نصائح مالية' },
        { label: '📈 تحليل الإنفاق', message: 'حلل إنفاقي الشهر الماضي' }
      ],
      ma: [
        { label: '💰 الحسابات ديالي', message: 'ورّيني الحسابات ديالي' },
        { label: '📊 المعاملات ديالي', message: 'ورّيني آخر معاملات' },
        { label: '💡 نصائح مالية', message: 'عطيني نصائح مالية' },
        { label: '📈 تحليل المصاريف', message: 'حلّل المصاريف ديالي الشهر اللي فات' }
      ]
    };
    return suggestions[this.selectedLanguage] || suggestions['en'];
  }


  sendQuickMessage(message: string) {
    this.currentMessage = message;
    this.sendMessage();
  }


  getFinancialDataLabel(): string {
    const labels = {
      fr: 'Données financières',
      en: 'Financial Data',
      ar: 'البيانات المالية',
      ma: 'البيانات المالية'
    };
    return labels[this.selectedLanguage];
  }

  getTransactionListLabel(): string {
    const labels = {
      fr: 'Liste des transactions',
      en: 'Transaction List',
      ar: 'قائمة المعاملات',
      ma: 'قائمة المعاملات'
    };
    return labels[this.selectedLanguage];
  }

  getErrorLabel(): string {
    const labels = {
      fr: 'Erreur système',
      en: 'System Error',
      ar: 'خطأ في النظام',
      ma: 'خطأ في النظام'
    };
    return labels[this.selectedLanguage];
  }

  getFormattedMessage(text: string): SafeHtml {
    try {
      // Preprocess the text to handle \n\n properly
      let processedText = text
        .replace(/\n\n/g, '\n')
        .replace(/\\n/g, '\n');


      // Configure marked options
      marked.setOptions({
        breaks: true,        // Convert single \n to <br>
        gfm: true,          // GitHub Flavored Markdown
      });

      // Convert markdown to HTML
      const htmlContent = marked.parse(processedText) as string;

      // Post-process to ensure proper spacing
      const finalHtml = htmlContent
        // Ensure paragraphs have proper spacing
        .replace(/<\/p>\s*<p>/g, '</p><p>')
        // Convert any remaining literal \n to <br>
        .replace(/\n/g, '<br>');

      // Sanitize and return safe HTML
      return this.sanitizer.bypassSecurityTrustHtml(finalHtml);
    } catch (error) {
      console.error('Error parsing markdown:', error);
      // Fallback with proper newline handling
      const fallbackHtml = text
        .replace(/\\n\\n/g, '<br><br>')
        .replace(/\\n/g, '<br>')
        .replace(/\n\n/g, '<br><br>')
        .replace(/\n/g, '<br>');

      return this.sanitizer.bypassSecurityTrustHtml(fallbackHtml);
    }
  }

}
