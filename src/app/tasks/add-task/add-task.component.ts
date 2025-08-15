import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { DataService } from '../../data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { combineLatest, of } from 'rxjs';

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
    const hasForbiddenWord = forbiddenWords.some(word => lowerValue.includes(word));
    if (hasForbiddenWord) return of({ forbiddenTitle: true });
  }
  return of(null);
}

@Component({
  selector: 'app-add-task',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.css'],
  providers: [provideNativeDateAdapter()]
})
export class AddTaskComponent implements OnInit {

  taskId = input.required<string>();
  public task: any;
  public tasks: any;
  public loading: boolean = true;
  public error: string = '';
  public title = 'Add Task';
  public emp: any;
  public teamData: any;
  public addTaskForm!: FormGroup;
  public edit = false;

  statusOptions = [
    { value: '0', label: 'To Do' },
    { value: '1', label: 'Analyse' },
    { value: '2', label: 'Development' },
    { value: '3', label: 'QA' },
    { value: '4', label: 'Done' }
  ];

  tasksType = [
    { value: '0', label: 'BugFix' },
    { value: '1', label: 'HotFix' },
    { value: '2', label: 'Feature' },
    { value: '3', label: 'Research' },
    { value: '4', label: 'Update' }
  ];

  private dataService = inject(DataService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get taskId from route if editing
    this.taskId = this.route.snapshot.params['taskId'];

    // Combine tasks, employee, and team data to initialize form once all are ready
    const tasks$ = this.dataService.tasks$;
    const emp$ = this.dataService.employee$;
    const team$ = this.dataService.employeesByTeam$;

    const combined$ = combineLatest([tasks$, emp$, team$]);

    const subscription = combined$.subscribe(
      ([tasks, emp, teamData]) => {
        this.tasks = tasks;
        this.emp = emp;
        this.teamData = teamData.filter(d => d._id !== this.emp._id);

        // Determine if editing an existing task
        this.task = this.tasks?.find((t: any) => t._id === this.taskId);
        if (this.task) {
          this.title = 'Edit Task';
          this.edit = true;

        }

        // Initialize form
        this.initializeForm();

        this.loading = false;
      },
      error => {
        this.error = 'Failed to load data.';
        this.loading = false;
      }
    );

    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  initializeForm() {
    this.addTaskForm = new FormGroup({
      _id: new FormControl(this.task?._id || null),
      title: new FormControl(this.task?.title || '', {
        validators: [Validators.required, Validators.minLength(5), mustStartWithUppercaseAlphabet],
        asyncValidators: [forbiddenTitle],
        updateOn: 'change'
      }),
      description: new FormControl(this.task?.description || '', {
        validators: [Validators.required, Validators.minLength(10)],
        updateOn: 'change'
      }),
      status: new FormControl(this.task?.status || '', Validators.required),
      type: new FormControl(this.task?.type || '', Validators.required),
      empId: new FormControl(
        this.task?.empId || this.teamData?.[0]?._id || '',
        Validators.required
      ),
      completionDate: new FormControl(this.task?.completionDate || null, Validators.required)
    });
  }

  closePopup() {
    this.router.navigate(['/tasks']);
  }

  onAddingTask() {
    this.loading = true;
    if(this.task) {
      this.addTaskForm.patchValue({ _id: this.task._id });
    }
    this.dataService.createTask(this.addTaskForm.value).subscribe(
      response => {
        console.log('Task saved successfully:', response);
        this.dataService.fetchAndStoreEmployeeTasks();
        this.router.navigate(['/tasks']);
        this.loading = false
      },
      error => {
        console.error('Error saving task:', error);
        this.loading = false
        this.router.navigate(['/tasks']);
      }
    );
  }
}
