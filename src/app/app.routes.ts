import { Routes } from '@angular/router';

import { TasksComponent } from './tasks/tasks.component';
import { AuthComponent } from './auth/auth.component';
import { AuthGuard } from './auth/auth.guard';
import { BrandingComponent } from './branding/branding.component';
import {routes as userRoutes} from './tasks/tasks.routes';

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
    children: userRoutes
  },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(mod => mod.DashboardComponent), canActivate: [AuthGuard] },
  { path: 'chat', loadComponent: () => import('./chat/chat-all/chat-all.component').then(mod => mod.ChatAllComponent), canActivate: [AuthGuard] },
  { path: 'profile', loadComponent: () => import('./profile/profile.component').then(mod => mod.ProfileComponent), canActivate: [AuthGuard] },
  {path: '**', redirectTo: '/', pathMatch: 'full'}
];
