//import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { DataService } from "./data.service";
import { environment } from "../environments/environment.prod";

interface CustomJwtPayload extends JwtPayload {
  email: string;
}

@Injectable({providedIn:'root'})
export class AuthService {

  private API_URL =environment.apiUrl || 'http://localhost:9000';
  private ACCESS_TOKEN_KEY = 'accessToken';

  constructor(private dataService: DataService) {}

   getAccessToken() {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  async signUp(email: string, password: string, firstName: string, lastName: string, dob: string, mobileNo: string, pan: string, gender: string, team: string, designation: string, address: string, address2: string, city: string, zip: string ) {
    const response = await fetch(`${this.API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, firstName, lastName, dob, mobileNo, pan, gender, team, designation, address, address2, city, zip }),
      credentials: 'include',
    });
    if (!response.ok) {
      return null;
    }
    return null;
  }


  async login(email: string, password: string) {
    const response = await fetch(`${this.API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    if (!response.ok) {
      return null;
    } else {

      const { token } = await response.json();
      localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
      const user = this.getUserFromToken(token);
      if (user?.id) {
        this.dataService.setEmployeeId(user.id);
        this.dataService.fetchAndStoreEmployeeData();
        this.dataService.fetchAndStoreEmployeeTasks();
        this.dataService.fetchAndStoreMessages();
      }
      return user;
    }

  }

  logout() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    this.dataService.employeeIdSubject.next(null);
    this.dataService.employee$.next(null);
  }

  autoLogin() {
    const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    if(!token) {
      return;
    }
    const user = this.getUserFromToken(token);
    if (user?.id) {
      this.dataService.setEmployeeId(user.id);
      this.dataService.fetchAndStoreEmployeeData();
      this.dataService.fetchAndStoreEmployeeTasks();
      this.dataService.fetchAndStoreMessages();

    }
  }

   getUserFromToken(token) {
    const claims = jwtDecode<CustomJwtPayload>(token);
    return {
      id: claims.sub,
      email: claims.email,
    };
  }

}
