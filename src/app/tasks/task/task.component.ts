import { Component, inject, input, OnInit } from '@angular/core';
import { DataService } from '../../data.service';
import { CommonModule } from '@angular/common';
import { ActivatedRouteSnapshot, ResolveFn, RouterModule } from '@angular/router';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { NgxEditorModule } from 'ngx-editor';
import { Timeline } from 'primeng/timeline';

interface EventItem {
  value?: string;
  updayedAt?: string;
}

@Component({
  selector: 'app-task',
  imports: [CommonModule, RouterModule, Tag, Button, NgxEditorModule, Timeline],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent implements OnInit{
  taskId = input.required<string>();
  public task: any;
  public title: string = '';
  public empName: string = '';
  public assigneeId: string = '';
  public tasks: any = [];
  public loading: boolean = true;
  public error: string = '';
  private dataService = inject(DataService);
  events!: EventItem[];

  constructor() {
    // this.taskId.valueChanges.subscribe(taskId => {
      // this.fetchTasks();
      // this.task = this.tasks?.find((task: any) => task._id === this.taskId());
      // this.assigneeId = this.task?.assigneeId || '';
      // this.fetchEmployeeName(this.assigneeId);
      // this.events = this.task.status.map(s => ({
      //   status: s.value,
      //   date: s.updatedAt,
      // }));
    // });
  }

  ngOnInit(): void {
    this.fetchTasks();
    // this.task = this.tasks?.find((task: any) => task._id === this.taskId());
    this.assigneeId = this.task?.assigneeId || '';
    this.fetchEmployeeName(this.assigneeId);

    this.events = this.task.status.map(s => ({
      status: s.value,
      date: s.updatedAt,
    }));

  }

  fetchTasks() {
    this.dataService.tasks$.subscribe(data => {
      this.tasks = data;
      this.task = this.tasks?.find((task: any) => task._id === this.taskId());
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
        return 'secondary';
      case 'Study':
        return 'help';
      case 'Revision':
        return 'teal';
      case 'Documentation':
        return 'light';
      default:
        return null;
    }
  }


}

export const resolveTaskTitle: ResolveFn<string> = (activatedRoute: ActivatedRouteSnapshot) => {
  const taskId = activatedRoute.paramMap.get('taskId');
  const dataService = inject(DataService);
  let taskTitle = 'Unknown Task';
  if(!taskId) {
    taskTitle = 'Add Task';
  }
  dataService.tasks$.subscribe(tasks => {
    const task = tasks.find((task: any) => task._id === taskId);
    taskTitle =  task ? task.title : taskTitle;
  })
  return taskTitle;
}
