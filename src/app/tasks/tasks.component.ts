import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [ RouterLink, CommonModule, RouterOutlet],
  templateUrl: './tasks.component.html',
  styleUrl: './tasks.component.css'
})
export class TasksComponent implements OnInit {
  public tasks: any;
  public loading: boolean = true;
  public error: string = '';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.fetchTasks();
  }

  fetchTasks() {
    this.dataService.tasks$.subscribe(data => {
      this.tasks = data;
      this.loading = false;
    }, error => {
      this.tasks = null;
      this.error = 'Failed to load employee tasks.';
      this.loading = false;
    }
    )
  }
}
