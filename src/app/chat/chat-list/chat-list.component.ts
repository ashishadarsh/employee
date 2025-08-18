import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DataService } from '../../data.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-list',
  imports: [RouterOutlet, RouterLink, CommonModule, RouterLinkActive],
  templateUrl: './chat-list.component.html',
  styleUrl: './chat-list.component.css'
})
export class ChatListComponent {

  public emp: any;
  public teamData: any;
  public loading: boolean = true;
  public error: string = '';

  constructor(private router: Router, private dataService: DataService) {}

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
