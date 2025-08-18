import { effect, inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, from } from 'rxjs';
import { getEmployee, getEmployeeTasks, getEmployeesByTeam, getMessages, messgeAddedSubscription, createNewTask, getUnicastMessages, unicastMessageAddedSubscription, deleteTask } from './graphql/queries';
import { ApolloClient } from '@apollo/client/core';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apolloClient = inject(ApolloClient);

  public employeeIdSubject = new BehaviorSubject<string | undefined | null>(undefined);
  public receiverEmployeeIdSubject = new BehaviorSubject<string | undefined | null>(undefined);
  public employee$ = new BehaviorSubject<any>(null);
  public employeesByTeam$ = new BehaviorSubject<any>(null);
  public tasks$ = new BehaviorSubject<any>(null);
  public messages$ = new BehaviorSubject<any[]>([]);
  public unicastMessages$ = new BehaviorSubject<any[]>([]);
  public receiverEmpId = signal<string | undefined | null>(undefined);
  private hasSubscribedToUnicast = false;

  constructor() {
    effect(() => {
      const receiverId = this.receiverEmpId();
      if (receiverId) {
        this.fetchAndStoreUnicastMessages(); // or anything else
      }
    });
  }


  getMessages(): Observable<any> {
    const employeeId = this.employeeIdSubject.value;
    if (!employeeId) {
      return EMPTY;
    }
    return from(getMessages());
  }

  getUnicastMessages(receiverEmpId: string): Observable<any> {
    const senderEmpId = this.employeeIdSubject.value;
    if (!senderEmpId || !receiverEmpId) {
      return EMPTY;
    }
    return from(getUnicastMessages(senderEmpId, receiverEmpId));
  }


  // Fetch employee data as Observable
  getEmployeeData(): Observable<any> {
    const employeeId = this.employeeIdSubject.value;
    if (!employeeId) {
      return EMPTY;
    }
    return from(getEmployee(employeeId));
  }

  getTaskAssigneeData(employeeId): Observable<any> {
    // const employeeId = this.employeeIdSubject.value;
    if (!employeeId) {
      return EMPTY;
    }
    return from(getEmployee(employeeId));
  }

  getEmployeesByTeam(): Observable<any> {
    const employee = this.employee$.value;
    if (!employee) {
      return EMPTY;
    }
    return from(getEmployeesByTeam(employee.team));
  }

  // Fetch employee tasks as Observable
  getEmployeeAllTasks(): Observable<any> {
    const employeeId = this.employeeIdSubject.value;
    if (!employeeId) {
      return EMPTY;
    }
    return from(getEmployeeTasks(employeeId));
  }

  // get employeeId$(): Observable<string | undefined> {
  //   return this.employeeIdSubject.asObservable();
  // }

  // Set employee ID and notify subscribers
  setEmployeeId(id: string | undefined) {
    this.employeeIdSubject.next(id);
  }

  // Create a new task
  createTask(taskData: any): Observable<any> {
    return from(createNewTask(taskData));
  }

  deleteTask(taskId: string): Observable<any> {
    return from(deleteTask(taskId));
  }

  // Fetch and store data
  fetchAndStoreEmployeeData() {
    this.getEmployeeData().subscribe(
      (data) => {
        this.employee$.next(data);
        this.getEmployeesByTeam().subscribe(
          (teamData) => {
            this.employeesByTeam$.next(teamData)
          },
          (error) => console.error('Error fetching employees by team:', error)
        );
      },
      (error) => {
        console.error('Error fetching employee data:', error);
      }
    );
  }


  fetchAndStoreEmployeeTasks() {
    this.getEmployeeAllTasks().subscribe(
      (data) => {
        this.tasks$.next(data);
      },
      (error) => {
        console.error('Error fetching tasks data:', error);
      }
    );
  }

  // fetchAndStoreMessages() {
  //   this.getMessages().subscribe(
  //     (data) => {
  //       this.messages$.next(data);
  //     },
  //     (error) => {
  //       console.error('Error fetching messages:', error);
  //     }
  //   );
  // }

  fetchAndStoreMessages() {
    // Fetch existing messages
    this.getMessages().subscribe(
      (data) => {
        this.messages$.next(data);
        // Subscribe to new messages
        this.subscribeToNewMessages();
      },
      (error) => {
        console.error('Error fetching messages:', error);
      }
    );
  }

  fetchAndStoreUnicastMessages() {
    // Fetch existing messages
    this.getUnicastMessages(this.receiverEmpId()!).subscribe(
      (data) => {
        this.unicastMessages$.next(data);
        // Subscribe to new messages
        if (!this.hasSubscribedToUnicast) {
          this.subscribeToNewUnicastMessages();
          this.hasSubscribedToUnicast = true;
        }
      },
      (error) => {
        console.error('Error fetching messages:', error);
      }
    );
  }

  subscribeToNewMessages() {
    this.apolloClient
      .subscribe({
        query: messgeAddedSubscription,
      })
      .subscribe({
        next: ({ data }) => {
          const newMessage = data?.message;
          if (newMessage) {
            this.messages$.next([...(this.messages$.value || []), newMessage]);
          }
        },
        error: (error) => console.error('Subscription error:', error),
      });
  }

  subscribeToNewUnicastMessages() {
    this.apolloClient
      .subscribe({
        query: unicastMessageAddedSubscription,
      })
      .subscribe({
        next: ({ data }) => {
          const newMessage = data?.unicastMessageAdded;
          if (!newMessage) return;

          const currentUserId = this.employeeIdSubject.value;
          const activeReceiverId = this.receiverEmpId();
          const isRelevant =
            (newMessage.senderEmpId === currentUserId && newMessage.receiverEmpId === activeReceiverId) ||
            (newMessage.receiverEmpId === currentUserId && newMessage.senderEmpId === activeReceiverId);

          if (isRelevant) {
            const updated = [...(this.unicastMessages$.value || []), newMessage];
            this.unicastMessages$.next(updated);
          } else {
            console.log('⛔ Irrelevant message, skipped.');
          }
        },
        error: (error) => console.error('Subscription error:', error),
      });
  }
}
