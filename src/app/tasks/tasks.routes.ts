import { Routes } from "@angular/router";
import { AddTaskComponent } from "./add-task/add-task.component";
import { TaskComponent } from "./task/task.component";

export const routes: Routes =
[
  { path: 'add', component: AddTaskComponent },
  { path: ':taskId', component: TaskComponent }, // This route is for viewing a specific task
  // Add other child routes for tasks here
  { path: 'edit/:taskId', component: AddTaskComponent }
]
// Note: This file is specifically for the child routes of tasks.