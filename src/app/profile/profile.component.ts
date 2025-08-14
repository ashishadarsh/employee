import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';  // Assuming the service is named DataService
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  imports: [CommonModule, MatIconModule, RouterLink, RouterOutlet]
})
export class ProfileComponent implements OnInit {
  public emp: any;
  public teamData: any;
  public loading: boolean = true;
  public error: string = '';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.fetchEmployeeData()
  }

  fetchEmployeeData() {
    this.dataService.employee$.subscribe(data => {
      this.emp = data;
      this.dataService.employeesByTeam$.subscribe(teamData => {
        if(teamData) {
          this.teamData = teamData.filter(data => data._id !== this.emp._id);
        }
      }, error => {
        this.error = 'Failed to load employee data.';
      })
      this.loading = false;
      }, error => {
        this.emp = null;
        this.error = 'Failed to load employee data.';
        this.loading = false;
      }
    );
  }
}
