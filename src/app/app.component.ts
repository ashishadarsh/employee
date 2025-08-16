import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router,RouterOutlet } from '@angular/router';
import { DataService } from './data.service.js';
import { AuthService } from './auth.service.js';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { HeaderComponent } from './header/header.component.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [ CommonModule, RouterOutlet, MatIconModule, MatBadgeModule, HeaderComponent]
})

export class AppComponent implements OnInit {
  title = 'employee';
  // isAuthenticated: boolean = false;
  isInitialLoad: boolean = true;
  currentUrl: string |undefined
  constructor(private dataService: DataService, private authService: AuthService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.authService.autoLogin();

    this.route.url.subscribe(urlSegments => {
      this.currentUrl = '/' + urlSegments.map(segment => segment.path).join('/');
    });

    this.dataService.employeeIdSubject.subscribe(user => {
      this.authService.isAuthenticated.next(!!user);
      // ✅ Only navigate if no user and not already on /auth
      if (!this.authService.isAuthenticated && this.currentUrl !== '/auth') {
        this.router.navigate(['/auth']);
      }
    });
  }

}
