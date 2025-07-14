import { Component, computed, DestroyRef, inject, input, OnInit, viewChild } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms'
import {provideNativeDateAdapter} from '@angular/material/core';
import { DataService } from '../../data.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
// import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
@Component({
  selector: 'app-add-task',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css',
  providers:[provideNativeDateAdapter()]
})
export class AddTaskComponent  {

  statusOptions = [
    { value: '0', label: 'To Do' },
    { value: '1', label: 'Analyse' },
    { value: '2', label: 'Development' },
    { value: '3', label: 'QA' },
    { value: '4', label: 'Done' }
  ];

  userOptions = [
    { id: '0', name: 'Ayush Raj' },
    { id: '1', name: 'Ankit Kumar' },
    { id: '2', name: 'Radhika Kumari' },
    { id: '3', name: 'Sushant Raj' },
    { id: '4', name: 'Arav Pathak' }
  ];

  // taskid = input.required<string>();
  task: any;
  private dataService = inject(DataService);
  private activatedRoute = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef)
  public addTaskForm!: FormGroup;
  public teamMembers: any;

  constructor() {
    console.log("loading addtaskcomponent");

  }

  ngOnInit(): void {
    console.log("called ngoninit");

    this.addTaskForm = new FormGroup({
      'title': new FormControl(null, Validators.required),
      'description': new FormControl(null, Validators.required),
      // 'status': new FormControl('', Validators.required),
      // 'assignee': new FormControl('', Validators.required)
    })

//     this.destroyRef.onDestroy(() => taskSubscription.unsubscribe());
  }

  onAddingTask() {
    console.log(this.addTaskForm);

  }
}
