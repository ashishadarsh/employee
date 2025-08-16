import { Component, input, OnInit } from '@angular/core';
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
import { TabViewModule } from 'primeng/tabview';


@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterOutlet, FormsModule, TableModule, InputTextModule, IconField, InputIcon, Tag, Button, MenuModule, TabViewModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  public tasks: any[] = [];
  public loading = false;
  public error = '';
  public selectedStatus = '';
  public statusOptions: string[] = [];
  childRouteActive = false;
  archive = input<any>();
  public searchTerm: string = '';

  constructor(private dataService: DataService, private router: Router, private route: ActivatedRoute) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.childRouteActive = this.route.firstChild !== null;
      });
  }

  ngOnInit(): void {
      this.fetchTasks(this.archive()); // Pass to fetchTasks

  }

  fetchTasks(archive: string) {
    this.loading = true;
    this.dataService.tasks$
      .pipe(
        filter((tasks): tasks is any[] => Array.isArray(tasks)),
      )
      .subscribe(
        (tasks: any[]) => {
          // Filter based on archive value
          const filteredTasks = tasks.filter(task =>
            archive ? task.status === 'Done' : task.status !== 'Done'
          );

          this.tasks = filteredTasks.map(task => ({
            ...task,
            originalTitle: task.title,
            title: this.truncateString(task.title)
          }));

          this.statusOptions = [...new Set(this.tasks.map(task => task.status))];
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
    return str.length > 50 ? str.slice(0, 50) + '...' : str;
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
  const tasksFilteredByStatus = this.selectedStatus
    ? this.tasks.filter(task => task.status === this.selectedStatus)
    : this.tasks;

  if (!this.searchTerm) return tasksFilteredByStatus;

  const term = this.searchTerm.toLowerCase();
  return tasksFilteredByStatus.filter(task =>
    task.title.toLowerCase().includes(term)
  );
}

  onTabChange(event: any) {
    const index = event.index;
    this.router.navigate([index === 0 ? '/tasks' : '/tasks/history/archive']);
  }

}
