import { Component, HostListener, input, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { Button } from 'primeng/button';
import { InputIcon } from 'primeng/inputicon';
import { Tag } from 'primeng/tag';
import { MenuModule } from 'primeng/menu';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';

interface StickyNote {
  text: string;
  x: number;
  y: number;
  color: string;
}


@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterOutlet, FormsModule, TableModule, InputTextModule, IconField, InputIcon, Tag, Button, MenuModule, TabViewModule, TooltipModule],
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  public tasks: any[] = [];
  public loading = false;
  public error = '';
  public selectedStatus = '';
  public statusOptions: string[] = [];
  childRouteActive = false;
  archive = input<any>();
  public searchTerm: string = '';
  public taskItems: any[] = [];
  public activeIndex: number = 0;
  visible: boolean = false;

  notes: StickyNote[] = [];

  draggingNoteIndex: number | null = null;
  offsetX = 0;
  offsetY = 0;


  @ViewChild('taskMenu') taskMenu: any;
  // items: MenuItem[];

  constructor(private dataService: DataService, private router: Router, private route: ActivatedRoute) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.childRouteActive = this.route.firstChild !== null;
      });
  }

  // ngOnInit(): void {
  //     this.fetchTasks(this.archive()); // Pass to fetchTasks

  // }

  ngOnInit(): void {
    if (this.router.url.includes('archive')) {
      this.activeIndex = 1; // Archived
    } else if (this.router.url.includes('backlog')) {
      this.activeIndex = 2; // Backlog
    } else {
      this.activeIndex = 0; // Active
    }

    this.fetchTasks(this.activeIndex);
    const saved = localStorage.getItem('stickyNotes');
    if (saved) {
      this.notes = JSON.parse(saved);
    }
  }

  addNote() {
    const colors = ['#FFEB3B', '#FFCDD2', '#C8E6C9', '#BBDEFB', '#FFF9C4'];
    const newNote: StickyNote = {
      text: '',
      x: 50,
      y: 50,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    this.notes.push(newNote);
    this.saveNotes();
  }

  deleteNote(index: number) {
    this.notes.splice(index, 1);
    this.saveNotes();
  }

  startDrag(event: MouseEvent, index: number) {
    this.draggingNoteIndex = index;
    this.offsetX = event.clientX - this.notes[index].x;
    this.offsetY = event.clientY - this.notes[index].y;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.draggingNoteIndex !== null) {
      const note = this.notes[this.draggingNoteIndex];
      note.x = event.clientX - this.offsetX;
      note.y = event.clientY - this.offsetY;
      this.saveNotes();
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.draggingNoteIndex = null;
  }

  saveNotes() {
    localStorage.setItem('stickyNotes', JSON.stringify(this.notes));
  }


  // setTaskMenu(task: any) {
  //   this.taskItems = [
  //     {
  //       label: 'View Details',
  //       icon: 'pi pi-eye',
  //       command: () => this.router.navigate(['/tasks', task._id])
  //     },
  //     {
  //       label: 'Edit',
  //       icon: 'pi pi-pencil',
  //       command: () => this.router.navigate(['/tasks/edit', task._id])
  //     },
  //     {
  //       label: 'Move to Backlog',
  //       icon: 'pi pi-pencil',
  //       command: () => this.dataService.createTask({ ...task, backlog: task.backlog ?  !task.backlog : true}).subscribe({
  //         next: () => {
  //           task.backlog = !task.backlog;
  //           this.dataService.fetchAndStoreEmployeeTasks();
  //         },
  //         error: () => {
  //           this.error = 'Failed to move task to backlog.';
  //         }
  //       })
  //     },
  //     {
  //       label: 'Delete',
  //       icon: 'pi pi-trash',
  //       command: () => this.dataService.deleteTask(task._id).subscribe({
  //         next: () => {
  //           this.tasks = this.tasks.filter(t => t._id !== task._id);
  //           this.statusOptions = [...new Set(this.tasks.map(t => t.status))];
  //         },
  //         error: () => {
  //           this.error = 'Failed to delete task.';
  //         }
  //       })

  //     }
  //   ];
  // }

  // fetchTasks(archive: string) {
  //   console.log('Fetching tasks with archive:', archive);

  //   this.loading = true;
  //   this.dataService.tasks$
  //     .pipe(
  //       filter((tasks): tasks is any[] => Array.isArray(tasks)),
  //     )
  //     .subscribe(
  //       (tasks: any[]) => {
  //         // Filter based on archive value
  //         const filteredTasks = tasks.filter(task =>
  //           archive ? task.status === 'Done' : task.status !== 'Done'
  //         );

  //         this.tasks = filteredTasks.map(task => ({
  //           ...task,
  //           originalTitle: task.title,
  //           title: this.truncateString(task.title)
  //         }));
  //         this.statusOptions = [...new Set(this.tasks.map(task => task.status))];
  //         this.loading = false;
  //       },
  //       error => {
  //         this.tasks = [];
  //         this.error = 'Failed to load employee tasks.';
  //         this.loading = false;
  //       }
  //     );
  // }

  setTaskMenu(task: any) {
    this.taskItems = [
      {
        label: 'View Details',
        icon: 'pi pi-eye',
        command: () => this.router.navigate(['/tasks', task._id])
      },
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => this.router.navigate(['/tasks/edit', task._id])
      },
      {
        label: task.backlog ? 'Move to Active' : 'Move to Backlog',
        icon: task.backlog ? 'pi pi-check-circle' : 'pi pi-arrow-left',
        command: () => {
          task.status = task.status.map(s => {
            const { __typename, ...rest } = s; // destructuring to remove taskName
            return rest;
          });
          this.dataService.createTask({ ...task, backlog: !task.backlog }).subscribe({
            next: () => {
              task.backlog = !task.backlog; // flip backlog
              this.dataService.fetchAndStoreEmployeeTasks();
            },
            error: () => {
              this.error = task.backlog
                ? 'Failed to move task to Active.'
                : 'Failed to move task to Backlog.';
            }
          });
        }
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => this.dataService.deleteTask(task._id).subscribe({
          next: () => {
            this.tasks = this.tasks.filter(t => t._id !== task._id);
            this.statusOptions = [...new Set(this.tasks.map(t => t.status))];
          },
          error: () => {
            this.error = 'Failed to delete task.';
          }
        })
      }
    ];
  }


  fetchTasks(tabIndex: number) {
    this.loading = true;
    this.dataService.tasks$
      .pipe(filter((tasks): tasks is any[] => Array.isArray(tasks)))
      .subscribe(
        (tasks: any[]) => {
          let filteredTasks: any[] = [];

          if (tabIndex === 0) {
            // Active → status not Done and not backlog
            filteredTasks = tasks.filter(task => task.status[task.status.length - 1].value !== 'Done' && !task.backlog);
          } else if (tabIndex === 1) {
            // Archived → status Done
            filteredTasks = tasks.filter(task => task.status[task.status.length - 1].value === 'Done' && !task.backlog);
          } else if (tabIndex === 2) {
            // Backlog → backlog true
            filteredTasks = tasks.filter(task => task.backlog);
          }

          this.tasks = filteredTasks.map(task => ({
            ...task,
            originalTitle: task.title,
            title: this.truncateString(task.title),
          }));
          this.statusOptions = [...new Set(this.tasks.map(t => t.status))];
          this.loading = false;
        },
        error => {
          this.tasks = [];
          this.error = 'Failed to load employee tasks.';
          this.loading = false;
        }
      );
  }


  togglePriority(task, event) {
    task.status = task.status.map(s => {
      const { __typename, ...rest } = s; // destructuring to remove taskName
      return rest;
    });
   this.dataService.createTask({ ...task, priority: !task.priority }).subscribe({
      next: () => {
        task.priority = !task.priority;
        this.dataService.fetchAndStoreEmployeeTasks();
      },
      error: () => {
        this.error = 'Failed to update task priority.';
      }
    });
  }

  togglePin(task, event) {
    // remove field __typename from all objects of status array
    task.status = task.status.map(s => {
      const { __typename, ...rest } = s; // destructuring to remove taskName
      return rest;
    });
    this.dataService.createTask({...task, pinned: !task.pinned}).subscribe({
      next: () => {
        task.pinned = !task.pinned;
        this.dataService.fetchAndStoreEmployeeTasks();
      },
      error: () => {
        this.error = 'Failed to update task pinned state.';
      }
    });
  }


  truncateString(str) {
    if (typeof str !== 'string') return '';
    return str.length > 50 ? str.slice(0, 50) + '...' : str;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  getSeverity(status: string) {
    switch (status) {
        case 'To Do':
            return 'danger';

        case 'Done':
            return 'success';

        case 'Development':
            return 'info';

        case 'QA':
            return 'warn';

        case 'Analyse':
            return 'secondary';
        default:
            return 'contrast';
    }
}


getSeverityType(type: string) {
  switch (type) {
    case 'HotFix':
      return 'danger';
    case 'Research':
      return 'success';
    case 'Feature':
      return 'info';
    case 'BugFix':
      return 'warn';
    case 'Update':
      return 'secondary';
    case 'Study':
      return 'primary';
    case 'Revision':
      return 'secondary';
    case 'Documentation':
      return 'light';
    default:
      return null;
  }
}


get filteredTasks() {
  const tasksFilteredByStatus = this.selectedStatus
    ? this.tasks.filter(task => task.status === this.selectedStatus)
    : this.tasks;

  if (!this.searchTerm) return tasksFilteredByStatus;

  const term = this.searchTerm.toLowerCase();
  return tasksFilteredByStatus.filter(task =>
    task.title.toLowerCase().includes(term)
  );
}

  // onTabChange(event: any) {
  //   const index = event.index;
  //   this.router.navigate([index === 0 ? '/tasks' : '/tasks/history/archive']);
  // }

  onTabChange(event: any) {
    const index = event.index;
    this.activeIndex = index;

    if (index === 0) {
      this.router.navigate(['/tasks']); // Active
    } else if (index === 1) {
      this.router.navigate(['/tasks/history/archive']); // Archived
    } else if (index === 2) {
      this.router.navigate(['/tasks/backlog']); // Backlog
    }

    this.fetchTasks(index);
  }


  getTaskStatus(taskId: string) {
    const task = this.tasks.find(t => t._id === taskId && t.status[t.status.length - 1].value !== 'Done');
    if (!task) return null;

    const currentDate = new Date();
    const dueDate = new Date(task.completionDate);
    const diff = Math.ceil((dueDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));

    if (diff > 0) {
      return { text: `${diff} days left`, type: 'left' };
    } else if (diff === 0) {
      return { text: `Last day`, type: 'last' };
    } else {
      return { text: `${Math.abs(diff)} days delayed`, type: 'delayed' };
    }
  }
}
