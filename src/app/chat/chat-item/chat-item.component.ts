import { Component, effect, ElementRef, input, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { DataService } from '../../data.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { addUnicastMessage } from '../../graphql/queries';

@Component({
  selector: 'app-chat-item',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-item.component.html',
  styleUrl: './chat-item.component.css'
})
export class ChatItemComponent {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  id = input.required<string>();
  name = input.required<string>();

  private destroy$ = new Subject<void>();
  private firstLoad = true;

  messages: any[] = [];
  newMessage = '';
  currentUser: any;

  constructor(private dataService: DataService, private router: Router) {
    // 🔄 React whenever `id` changes
    effect(() => {
      const receiverId = this.id();
      if (!receiverId) return;

      this.resetChat(receiverId);
      this.subscribeToMessages();
    });
  }

  ngOnInit(): void {
    // 👤 Track logged-in user
    this.dataService.employee$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => this.currentUser = user);
  }

  // 🔄 Reset chat when switching users
  private resetChat(receiverId: string): void {
    this.messages = [];
    this.firstLoad = true;

    if (receiverId !== this.dataService.receiverEmpId()) {
      this.dataService.receiverEmpId.set(receiverId);
    }
  }

  // 📩 Subscribe to incoming messages
  private subscribeToMessages(): void {
    this.dataService.unicastMessages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        const shouldScroll = this.isScrolledToBottom();
        this.messages = data;
        if (shouldScroll) this.scrollToBottom();
      });
  }

  // 📨 Send new message
  sendMessage(): void {
    if (!this.newMessage.trim() || !this.currentUser) return;

    addUnicastMessage(this.newMessage, this.currentUser._id, this.id());
    this.newMessage = '';
    this.scrollToBottom();
  }

  // 📜 Helpers
  private isScrolledToBottom(): boolean {
    if (!this.messagesContainer) return false;
    const { scrollTop, scrollHeight, clientHeight } = this.messagesContainer.nativeElement;
    return scrollTop + clientHeight >= scrollHeight - 5;
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight - el.clientHeight;
      }
    }, 100);
  }

  getInitials(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0]?.toUpperCase() || '';
  }

  // ✅ Lifecycle
  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  ngAfterViewChecked(): void {
    if (this.firstLoad && this.messages.length > 0) {
      this.scrollToBottom();
      this.firstLoad = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
