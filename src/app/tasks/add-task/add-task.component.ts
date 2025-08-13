import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms'
import {provideNativeDateAdapter} from '@angular/material/core';
import { DataService } from '../../data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';

function mustStartWithUppercaseAlphabet(control: AbstractControl) {
  const value = control.value;
  if (value && !/^[A-Z]/.test(value)) {
    return { mustStartWithUppercaseAlphabet: true };
  }
  return null;
}

export function forbiddenTitle(control: AbstractControl) {
  const value = control.value;
  const forbiddenWords = ['test', 'demo'];

  if (value) {
    const lowerValue = value.toLowerCase();
    // Check if any forbidden word is included in the value
    const hasForbiddenWord = forbiddenWords.some(word =>
      lowerValue.includes(word)
    );

    if (hasForbiddenWord) {
      return of({ forbiddenTitle: true });
    }
  }

  return of(null);
}

// import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
@Component({
  selector: 'app-add-task',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css',
  providers:[provideNativeDateAdapter()]
})
export class AddTaskComponent implements OnInit {

  taskId = input.required<string>();
  //public activatedRoute = inject(ActivatedRoute);
  // 2. paramTaskId = signal<string>('');
  // taskId = computed(() => this.activatedRoute.snapshot.params['taskid']);

  public task: any;
  public tasks: any;
  public loading: boolean = true;
  public error: string = '';
  public title = 'Add Task';
  public emp: any;
  public teamData: any;
  public assigneeId: string = '';


  statusOptions = [
    { value: '0', label: 'To Do' },
    { value: '1', label: 'Analyse' },
    { value: '2', label: 'Development' },
    { value: '3', label: 'QA' },
    { value: '4', label: 'Done' }
  ];

  // userOptions = [
  //   { id: '0', name: 'Ayush Raj' },
  //   { id: '1', name: 'Ankit Kumar' },
  //   { id: '2', name: 'Radhika Kumari' },
  //   { id: '3', name: 'Sushant Raj' },
  //   { id: '4', name: 'Arav Pathak' }
  // ];

  // taskid = input.required<string>();

  private dataService = inject(DataService);
  private destroyRef = inject(DestroyRef)
  public addTaskForm!: FormGroup;
  public teamMembers: any;

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    // 2.
    // const subscription = this.activatedRoute.paramMap.subscribe(params => {
    //   const taskId = params.get('taskId');
    //   if (taskId) {
    //     this.paramTaskId.set(taskId);
    //   }
    //   }
    // );

    //console.log("paramTaskId", this.paramTaskId());


    this.fetchTasks();
    this.fetchEmployeeData();
    this.task = this.tasks?.find((task: any) => task._id === this.taskId());


    if (this.task) {
      this.title = 'Edit Task';
    }
    this.addTaskForm = new FormGroup({
      'title': new FormControl(this.task?.title? this.task?.title: null, {
        validators: [Validators.required, Validators.minLength(5), mustStartWithUppercaseAlphabet],
        asyncValidators: [forbiddenTitle],
      }),
      'description': new FormControl(this.task?.description? this.task?.description: null, {
        validators: [Validators.required, Validators.minLength(10), mustStartWithUppercaseAlphabet],
        updateOn: 'blur'
      }),
      'status': new FormControl(this.task?.status? this.task?.status: '', Validators.required),
      'empId': new FormControl(this.task?.empId? 'Salman': '', Validators.required),
      completionDate: new FormControl(this.task?.completionDate? this.task?.completionDate: null, Validators.required)
    })
    //this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  fetchEmployeeData() {
    const subs = this.dataService.employee$.subscribe(data => {
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

    this.assigneeId = this.emp?._id || '';

    this.destroyRef.onDestroy(() => subs.unsubscribe());
  }


  fetchTasks() {
    this.dataService.tasks$.subscribe(data => {
      this.tasks = data;
      this.loading = false;
    }, error => {
      this.tasks = null;
      this.error = 'Failed to load employee tasks.';
      this.loading = false;
    }
    )
  }

  closePopup() {
    this.router.navigate(['/tasks']);
  }

  onAddingTask() {
    console.log(this.addTaskForm);
    this.router.navigate(['/tasks']);
  }
}
