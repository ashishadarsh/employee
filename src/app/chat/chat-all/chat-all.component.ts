import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../data.service';
import { addMessage } from '../../graphql/queries';

@Component({
  selector: 'app-chat-all',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-all.component.html',
  styleUrls: ['./chat-all.component.css']
})
export class ChatAllComponent implements OnInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: any[] = [];
  newMessage = '';
  currentUser: any;
  private lastMessageCount = 0;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.employee$.subscribe(data => {
      this.currentUser = data;
    });
    this.fetchMessages();
  }

  fetchMessages() {
    this.dataService.messages$.subscribe(data => {
      // Check if a new message was added
      if (data.length > this.lastMessageCount) {
        this.messages = data;
        this.scrollToBottom();
      } else {
        this.messages = data; // just update without scrolling
      }
      this.lastMessageCount = data.length;
    });
  }

  sendMessage() {
    if (this.newMessage.trim() && this.currentUser) {
      addMessage(this.newMessage, this.currentUser._id);
      this.newMessage = '';
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        const container = this.messagesContainer.nativeElement;
        container.scrollTop = container.scrollHeight;
      }
    }, 50); // delay to ensure new message is rendered
  }
}
