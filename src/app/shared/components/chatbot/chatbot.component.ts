import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  // Multilingual responses
  private responses = {
    fr: [
      "Bonjour ! Comment puis-je vous aider avec vos services bancaires aujourd'hui ?",
      "Je peux vous aider avec vos comptes, virements, et autres services bancaires.",
      "Pour plus d'informations sur vos comptes, consultez la section 'Mes Comptes'.",
      "Vous pouvez effectuer un virement en accédant à la section 'Virements'.",
      "Avez-vous besoin d'aide pour ajouter un nouveau bénéficiaire ?",
      "Vos données sont sécurisées avec notre système de cryptage avancé.",
      "Pour consulter l'historique de vos transactions, rendez-vous dans 'Transactions'.",
      "Je suis là pour vous aider 24h/24 et 7j/7 !",
      "Souhaitez-vous connaître votre solde actuel ?",
      "N'hésitez pas à me poser des questions sur nos services bancaires."
    ],
    en: [
      "Hello! How can I help you with your banking services today?",
      "I can assist you with your accounts, transfers, and other banking services.",
      "For more information about your accounts, check the 'My Accounts' section.",
      "You can make a transfer by accessing the 'Transfers' section.",
      "Do you need help adding a new recipient?",
      "Your data is secure with our advanced encryption system.",
      "To view your transaction history, go to 'Transactions'.",
      "I'm here to help you 24/7!",
      "Would you like to know your current balance?",
      "Feel free to ask me questions about our banking services."
    ],
    ar: [
      "مرحباً! كيف يمكنني مساعدتك في خدماتك المصرفية اليوم؟",
      "يمكنني مساعدتك في حساباتك والتحويلات والخدمات المصرفية الأخرى.",
      "لمزيد من المعلومات حول حساباتك، تحقق من قسم 'حساباتي'.",
      "يمكنك إجراء تحويل عن طريق الوصول إلى قسم 'التحويلات'.",
      "هل تحتاج مساعدة في إضافة مستفيد جديد؟",
      "بياناتك آمنة مع نظام التشفير المتقدم لدينا.",
      "لعرض تاريخ معاملاتك، انتقل إلى 'المعاملات'.",
      "أنا هنا لمساعدتك على مدار الساعة!",
      "هل تريد معرفة رصيدك الحالي؟",
      "لا تتردد في طرح أسئلة حول خدماتنا المصرفية."
    ],
    ma: [
      "أهلاً! كيفاش نقدر نعاونك في الخدمات البنكية ديالك اليوم؟",
      "نقدر نعاونك في الحسابات ديالك والتحويلات والخدمات البنكية الأخرى.",
      "باش تعرف أكثر على الحسابات ديالك، شوف قسم 'الحسابات ديالي'.",
      "تقدر دير تحويل من قسم 'التحويلات'.",
      "واش محتاج مساعدة باش تزيد مستفيد جديد؟",
      "البيانات ديالك آمنة مع نظام التشفير المتقدم ديالنا.",
      "باش تشوف تاريخ المعاملات ديالك، مشي لـ'المعاملات'.",
      "أنا هنا باش نعاونك 24/7!",
      "واش بغيتي تعرف الرصيد ديالك دابا؟",
      "ما تتردّش تسولني على الخدمات البنكية ديالنا."
    ]
  };

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

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  closeModal(event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.closeRequest.emit();
  }

  onLanguageChange() {
    // Clear messages when language changes
    this.messages = [];
  }

  sendMessage() {
    if (!this.currentMessage.trim() || this.isTyping) return;

    // Add user message
    const userMessage: ChatMessage = {
      text: this.currentMessage,
      isUser: true,
      timestamp: this.getCurrentTime()
    };
    this.messages.push(userMessage);

    // Clear input
    const messageToProcess = this.currentMessage;
    this.currentMessage = '';

    // Show typing indicator
    this.isTyping = true;

    // Simulate bot response delay
    setTimeout(() => {
      const botResponse = this.generateResponse(messageToProcess);
      const botMessage: ChatMessage = {
        text: botResponse,
        isUser: false,
        timestamp: this.getCurrentTime()
      };
      this.messages.push(botMessage);
      this.isTyping = false;
    }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
  }

  private generateResponse(userMessage: string): string {
    const responses = this.responses[this.selectedLanguage];

    // Simple keyword-based responses
    const lowerMessage = userMessage.toLowerCase();

    // Account-related keywords
    if (lowerMessage.includes('account') || lowerMessage.includes('compte') || lowerMessage.includes('حساب')) {
      return responses[2]; // Account info response
    }

    // Transfer-related keywords
    if (lowerMessage.includes('transfer') || lowerMessage.includes('virement') || lowerMessage.includes('تحويل')) {
      return responses[3]; // Transfer response
    }

    // Balance-related keywords
    if (lowerMessage.includes('balance') || lowerMessage.includes('solde') || lowerMessage.includes('رصيد')) {
      return responses[8]; // Balance response
    }

    // Security-related keywords
    if (lowerMessage.includes('secure') || lowerMessage.includes('sécur') || lowerMessage.includes('أمان')) {
      return responses[5]; // Security response
    }

    // Default random response
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
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
