import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { DataService } from '../../data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { combineLatest, of } from 'rxjs';
import { Editor, Toolbar, NgxEditorModule } from 'ngx-editor';
import { Button } from 'primeng/button';

function mustStartWithUppercaseAlphabet(control: AbstractControl) {
  const value = control.value;
  if (value && !/^[A-Z]/.test(value)) {
    return { mustStartWithUppercaseAlphabet: true };
  }
  return null;
}

export function forbiddenTitle(control: AbstractControl) {
  const value = control.value;
  const forbiddenWords = [];

  if (value) {
    const lowerValue = value.toLowerCase();
    const hasForbiddenWord = forbiddenWords.some(word => lowerValue.includes(word));
    if (hasForbiddenWord) return of({ forbiddenTitle: true });
  }
  return of(null);
}

@Component({
  selector: 'app-add-task',
  imports: [ReactiveFormsModule, CommonModule, NgxEditorModule, Button, FormsModule],
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
  public tagInput: string = '';

  editor!: Editor;
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

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
    { value: '4', label: 'Update' },
    { value: '5', label: 'Study' },
    { value: '6', label: 'Revision' }
  ];

  private dataService = inject(DataService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.editor = new Editor();
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
        this.teamData = teamData;

        // Determine if editing an existing task
        this.task = this.tasks?.find((t: any) => t._id === this.taskId);
        if (this.task) {
          this.title = 'Edit Task';
          this.edit = true;
          // const assignedId = this.task.empId;
          // const assignedUser = teamData.find(d => d._id === assignedId);

          // // Include the assigned user if they aren't in the list
          // const filteredTeam = teamData.filter(d => d._id !== this.emp._id);
          // if (assignedUser && !filteredTeam.find(d => d._id === assignedUser._id)) {
          //   filteredTeam.push(assignedUser);
          // }

          // this.teamData = filteredTeam;
        } else {
          this.title = 'Add Task';
          //this.teamData = teamData.filter(d => d._id !== this.emp._id);
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
        validators: [Validators.required, Validators.minLength(5)],
        updateOn: 'change'
      }),
      status: new FormControl(this.task?.status.length? this.task.status[this.task.status.length - 1].value : '', Validators.required),
      type: new FormControl(this.task?.type || '', Validators.required),
      empId: new FormControl(
        { value: this.task?.empId ? this.task.empId: this.emp._id, disabled: this.edit },
        Validators.required
      ),
      completionDate: new FormControl(this.task?.completionDate || null, Validators.required),
      tags: new FormControl(this.task?.tags || [])
    });
  }

  addTag(event?: KeyboardEvent | Event) {
    if (event) {
      event.preventDefault?.(); // optional chaining for Event
    }

    const value = this.tagInput.trim();
    if (!value) return;

    const tagsControl = this.addTaskForm.get('tags')!;
    const tags = [...tagsControl.value]; // copy the current array

    if (!tags.includes(value)) {
      tags.push(value);
      tagsControl.setValue(tags); // update the FormControl
    }

    this.tagInput = '';
  }


  removeTag(index: number) {
    const tagsControl = this.addTaskForm.get('tags')!;
    const tags = [...tagsControl.value];
    tags.splice(index, 1);
    tagsControl.setValue(tags);
  }


  closePopup() {
    this.router.navigate(['/tasks']);
  }

  onAddingTask() {
    this.loading = true;

    const formData = this.addTaskForm.getRawValue(); // includes disabled fields

    if (this.task) {
      formData._id = this.task._id;
      formData.pinned = this.task.pinned; // Preserve pinned state if editing
      formData.priority = this.task.priority; // Preserve priority if editing
      formData.backlog = this.task.backlog; // Preserve backlog state if editing
      formData.assignedDate = this.task.assignedDate; // Preserve assigned date if editing
    }

    formData.status = {value: formData.status, updatedAt: new Date()};

    this.dataService.createTask(formData).subscribe(
      response => {
        this.dataService.fetchAndStoreEmployeeTasks();
        this.router.navigate(['/tasks']);
        this.loading = false;
      },
      error => {
        console.error('Error saving task:', error);
        this.loading = false;
        this.router.navigate(['/tasks']);
      }
    );
  }

  ngOnDestroy() {
    this.editor.destroy();
  }

}
