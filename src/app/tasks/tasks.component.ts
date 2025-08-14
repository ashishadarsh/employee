import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { Button } from 'primeng/button';
import { InputIcon } from 'primeng/inputicon';
import { Tag } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterOutlet, FormsModule, TableModule, InputTextModule, IconField, InputIcon, Tag, Button, MenuModule],
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
        this.tasks = [...data];
        this.tasks = this.tasks?.map((task: any) => {
          return {
            ...task,
            originalTitle: task.title,
            title: this.truncateString(task.title)
          };
        });
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

  truncateString(str) {
    if (typeof str !== 'string') return '';
    return str.length > 30 ? str.slice(0, 30) + '...' : str;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  getSeverity(status: string) {
    switch (status) {
        case 'To Do':
            return 'danger';

        case 'Done':
            return 'success';

        case 'Development':
            return 'info';

        case 'QA':
            return 'warn';

        case 'Analyse':
            return null;
        default:
            return null;
    }
}

getSeverityType(status: string) {
  switch (status) {
      case 'HotFix':
          return 'danger';

      case 'Research':
          return 'success';

      case 'Feature':
          return 'info';

      case 'BugFix':
          return 'warn';

      case 'Update':
          return null;
      default:
          return null;
  }
}


  get filteredTasks() {
    return this.selectedStatus
      ? this.tasks.filter(task => task.status === this.selectedStatus)
      : this.tasks;
  }
}
