import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../data.service';
import { addMessage } from '../../graphql/queries'

@Component({
  selector: 'app-chat-all',
  imports: [FormsModule, CommonModule],
  templateUrl: './chat-all.component.html',
  styleUrl: './chat-all.component.css'
})
export class ChatAllComponent implements OnInit {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: any = [];
  newMessage = '';
  currentUser: any;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.dataService.employee$.subscribe(data => {
      this.currentUser = data;
    })
    this.fetchMessages()
  }

  fetchMessages() {
    this.dataService.messages$.subscribe(data => {
      this.messages = data;
    })
    this.scrollToBottom();
    // this.dataService.fetchAndStoreMessages();
  }

  sendMessage() {
    if (this.newMessage.trim()) {
      const message = addMessage(this.newMessage);
      // this.messages.push(message);
      this.newMessage = '';
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      }
    }, 0); // Timeout ensures that scrolling happens after the view updates
  }

}
