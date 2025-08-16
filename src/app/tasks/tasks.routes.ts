import { Routes } from "@angular/router";
import { AddTaskComponent } from "./add-task/add-task.component";
import { resolveTaskTitle, TaskComponent } from "./task/task.component";

export const routes: Routes =
[
  { path: 'add', component: AddTaskComponent, title: 'Add Task' }, // This route is for adding a new task
  { path: ':taskId', component: TaskComponent, title: resolveTaskTitle }, // This route is for viewing a specific task
  // Add other child routes for tasks here
  { path: 'edit/:taskId', component: AddTaskComponent, title: resolveTaskTitle }
]
// Note: This file is specifically for the child routes of tasks.
