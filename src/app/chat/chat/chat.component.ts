import { Component, ElementRef, input, ViewChild } from '@angular/core';
import { DataService } from '../../data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addUnicastMessage } from '../../graphql/queries';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  id = input.required<string>();
  name = input.required<string>();
  private destroy$ = new Subject<void>();

  messages: any[] = [];
  newMessage = '';
  currentUser: any;
  private firstLoad = true;

  constructor(private dataService: DataService, private router: Router) {}

  ngAfterViewInit(): void {
    // Scroll after the view is initialized
    this.scrollToBottom();
  }

  ngAfterViewChecked(): void {
    // Ensure it scrolls on first load after messages render
    if (this.firstLoad && this.messages.length > 0) {
      this.scrollToBottom();
      this.firstLoad = false;
    }
  }

  ngOnInit(): void {
    this.dataService.employee$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this.currentUser = data;

      if (this.id() !== this.dataService.receiverEmpId()) {
        this.dataService.receiverEmpId.set(this.id());
      }

    });

    this.fetchMessages(); // subscribes to BehaviorSubject
  }

  fetchMessages() {
    this.dataService.unicastMessages$.pipe(takeUntil(this.destroy$)).subscribe(data => {
      const shouldScroll = this.isScrolledToBottom();
      this.messages = data;
      if (shouldScroll) {
        this.scrollToBottom();
      }
    });

  }

  private isScrolledToBottom(): boolean {
    if (!this.messagesContainer) return false;

    const { scrollTop, scrollHeight, clientHeight } = this.messagesContainer.nativeElement;
    return scrollTop + clientHeight >= scrollHeight - 5;
  }


  sendMessage() {
    if (this.newMessage.trim() && this.currentUser) {
      addUnicastMessage(this.newMessage, this.currentUser._id, this.id());
      this.newMessage = '';
      this.scrollToBottom();
    }
  }

  closeChat() {
    this.router.navigate(['/profile']); // navigate back to profile
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;

        el.scrollTop = el.scrollHeight - el.clientHeight; // Ensures full scroll
      }
    }, 100);
  }


  getInitials(fullName: string): string {
    if (!fullName) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0][0]?.toUpperCase() || '';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
