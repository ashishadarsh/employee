import { Routes } from '@angular/router';

import { TasksComponent } from './tasks/tasks.component';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from './auth/auth.guard';
import { BrandingComponent } from './branding/branding.component';
import {routes as userRoutes} from './tasks/tasks.routes';
import { ProfileComponent } from './profile/profile.component';
import { resolveUserName } from './app.component';

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
  { path: '', component: BrandingComponent, title: 'Assigniq' },
  { path: 'auth', component: AuthComponent, title: 'Authentication' },
  { path: 'tasks/history/:archive', component: TasksComponent, canActivate: [AuthGuard], title: ' Completed Tasks' },
  {
    path: 'tasks',
    component: TasksComponent,
    canActivate: [AuthGuard],
    children: userRoutes,
    title: 'Tasks'
  },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(mod => mod.DashboardComponent), canActivate: [AuthGuard], title: 'Dashboard' },
  { path: 'chat', loadComponent: () => import('./chat/chat-all/chat-all.component').then(mod => mod.ChatAllComponent), canActivate: [AuthGuard], title: 'Team Chat' },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard], title: 'Team' , children: [
    { path: 'chat/:id/:name', loadComponent: () => import('./chat/chat/chat.component').then(mod => mod.ChatComponent), canActivate: [AuthGuard], title: resolveUserName },
  ] },
  {path: '**', redirectTo: '/', pathMatch: 'full'}
];
