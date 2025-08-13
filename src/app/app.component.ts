import { Component, OnInit } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import { getEmployees, getEmployeeTasks} from './graphql/queries.js';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DataService } from './data.service.js';
import { AuthService } from './auth.service.js';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [ CommonModule, RouterOutlet, RouterLink, MatIconModule, MatBadgeModule, RouterLinkActive]
})

export class AppComponent implements OnInit {
  title = 'employee';
  isAuthenticated: boolean = false;
  isInitialLoad: boolean = true;
  currentUrl: string |undefined
  constructor(private dataService: DataService, private authService: AuthService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.authService.autoLogin();

    this.route.url.subscribe(urlSegments => {
      this.currentUrl = '/' + urlSegments.map(segment => segment.path).join('/');
      console.log('Current URL:', this.currentUrl);
    });

    this.dataService.employeeIdSubject.subscribe(user => {
      this.isAuthenticated = !!user;

      // ✅ Only navigate if no user and not already on /auth
      if (!this.isAuthenticated && this.currentUrl !== '/auth') {
        this.router.navigate(['/auth']);
      }
    });
  }


  logout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

}
