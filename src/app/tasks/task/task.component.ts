import { Component, inject, input, OnInit } from '@angular/core';
import { DataService } from '../../data.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-task',
  imports: [CommonModule, RouterModule],
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

}
