import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from "@angular/router";
import { DataService } from "../data.service";
import { map, take } from "rxjs";

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {

  constructor(private dataService: DataService, private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    return this.dataService.employeeIdSubject.pipe(take(1),map(userId => {
      const isAuth =  !!userId
      if(isAuth) {
        return true;
      }
      return this.router.createUrlTree(['/auth']);
    }))
  }
}
