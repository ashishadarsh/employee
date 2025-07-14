import { Routes } from '@angular/router';
import { TasksComponent } from './tasks/tasks.component';
import { ProfileComponent } from './profile/profile.component';
import { AddTaskComponent } from './tasks/add-task/add-task.component';
import { AuthComponent } from './auth/auth.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './auth/auth.guard';
import { BrandingComponent } from './branding/branding.component';
import { ChatAllComponent } from './chat/chat-all/chat-all.component';
// import { TaskComponent } from './tasks/task/task.component';

// export const routes: Routes = [
//   {path: '', component: BrandingComponent},
//   { path: 'auth', component: AuthComponent},
//   {path:'tasks', component: TasksComponent, canActivate:[AuthGuard]},
//   {path: 'tasks/add/:taskid', component: AddTaskComponent, canActivate:[AuthGuard]},
//   {path: 'dashboard', component: DashboardComponent, canActivate:[AuthGuard]},
//   {path: 'profile', component: ProfileComponent, canActivate:[AuthGuard]},
//   {path:'**', redirectTo: '/', pathMatch:'full'}
// ];


export const routes: Routes = [
  { path: '', component: BrandingComponent },
  { path: 'auth', component: AuthComponent },
  {
    path: 'tasks',
    component: TasksComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'add/:taskId', component: AddTaskComponent },
      // Add other child routes for tasks here
    ]
  },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'chat', component: ChatAllComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] }
];
