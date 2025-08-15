import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { DataService } from '../data.service';
import { LoadingSpinner } from '../shared/loading-spinner/loading-spinner';

@Component({
  selector: 'app-auth',
  imports: [FormsModule, CommonModule, LoadingSpinner],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  isLoginMode = true;
  showPassword = false; // for password toggle
  public user: any;
  public loading: boolean = false;
  public error: string = '';
  dateOfBirth!: Date;

  selectedTeam: string = '';
  designations: string[] = [];

  // Teams with their respective designations
  teamsWithDesignations = [
    {
      id: '0',
      name: 'Software',
      designations: [
        'Full Stack Developer',
        'Backend Developer',
        'Frontend Developer'
      ]
    },
    {
      id: '1',
      name: 'Admin',
      designations: [
        'Admin Assistant',
        'HR Admin'
      ]
    },
    {
      id: '2',
      name: 'HR',
      designations: [
        'HR Manager',
        'HR Executive',
        'Recruitment Specialist'
      ]
    },
    {
      id: '3',
      name: 'Operations & Support',
      designations: [
        'Operations Manager',
        'Customer Support Specialist',
        'Technical Support Engineer'
      ]
    },
    {
      id: '4',
      name: 'Sales & Marketing',
      designations: [
        'Sales Manager',
        'Marketing Specialist',
        'Business Development Manager'
      ]
    }
  ];

  genders = [
    { id: '0', name: 'Male' },
    { id: '1', name: 'Female' },
    { id: '2', name: 'Others' }
  ];

  // Detect system dark mode
  isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private router: Router
  ) {}

  onSwitchMode() {
    this.isLoginMode = !this.isLoginMode;
  }

  onTeamChange() {
    const team = this.teamsWithDesignations.find(t => t.name === this.selectedTeam);
    this.designations = team ? team.designations : [];
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    this.loading = true;

    if (this.isLoginMode) {
      const userData = this.authService.login(form.value.email, form.value.password);
      userData.then(data => {
        if (!data) {
          this.loading = false;
          this.error = 'Invalid credentials';
        } else {
          this.dataService.setEmployeeId(data?.id);
          this.loading = false;
        }
        this.router.navigate(['/tasks']);
      });
    } else if (!this.isLoginMode) {
      this.authService.signUp(
        form.value.email,
        form.value.password,
        form.value.firstName,
        form.value.lastName,
        form.value.dob,
        form.value.mobileNo,
        form.value.pan,
        form.value.gender,
        form.value.team,
        form.value.designation,
        form.value.address,
        form.value.address2,
        form.value.city,
        form.value.zip
      );
      this.loading = false;
    }

    form.reset();
  }
}
