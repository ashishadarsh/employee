import { CommonModule } from '@angular/common';
import { Component, computed, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../auth.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  public isAuthenticated = new BehaviorSubject<Boolean>(false);

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to the isAuthenticated BehaviorSubject from AuthService
    this.authService.isAuthenticated.subscribe(isAuth => {
      this.isAuthenticated.next(isAuth);
    });
  }

  logout() {
    this.authService.logout();
    this.isAuthenticated.next(false);
    this.router.navigate(['/auth']);
  }

}
