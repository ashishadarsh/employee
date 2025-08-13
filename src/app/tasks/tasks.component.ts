import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterOutlet, FormsModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  public tasks: any[] = [];
  public loading = true;
  public error = '';
  public selectedStatus = '';
  public statusOptions: string[] = [];
  childRouteActive = false;

  constructor(private dataService: DataService, private router: Router, private route: ActivatedRoute) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.childRouteActive = this.route.firstChild !== null;
      });
  }

  ngOnInit(): void {
    this.fetchTasks();
  }

  fetchTasks() {
    this.dataService.tasks$.subscribe(
      (data: any[]) => {
        this.tasks = data;
        this.statusOptions = [...new Set(data.map(task => task.status))];
        this.loading = false;
      },
      error => {
        this.tasks = [];
        this.error = 'Failed to load employee tasks.';
        this.loading = false;
      }
    );
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }


  get filteredTasks() {
    return this.selectedStatus
      ? this.tasks.filter(task => task.status === this.selectedStatus)
      : this.tasks;
  }
}
