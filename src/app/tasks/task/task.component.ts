import { Component, inject, input, OnInit } from '@angular/core';
import { DataService } from '../../data.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-task',
  imports: [CommonModule, RouterModule, Tag, Button],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent implements OnInit{
  taskId = input.required<string>();
  public task: any;
  public empName: string = '';
  public assigneeId: string = '';
  public tasks: any = [];
  public loading: boolean = true;
  public error: string = '';
  private dataService = inject(DataService);

  // constructor() {
  // console.log(`TaskComponent initialized with taskId: ${this.taskId()}`); // Debugging line to check taskId

  // }

  ngOnInit(): void {
    this.fetchTasks();
    this.task = this.tasks?.find((task: any) => task._id === this.taskId());
    this.assigneeId = this.task?.assigneeId || '';
    this.fetchEmployeeName(this.assigneeId);
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

  fetchEmployeeName(assigneeId) {
    this.dataService.getTaskAssigneeData(assigneeId).subscribe(data => {
      this.empName = data.firstName + ' ' + data.lastName;
    })
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

  getSeverityType(type: string) {
    switch (type) {
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


}
