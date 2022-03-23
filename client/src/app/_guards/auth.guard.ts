import { ToastrService } from 'ngx-toastr';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AccountService } from '../_services/account.service';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  isAuthorized:boolean = false;
  constructor(private accountService:AccountService, private toastr:ToastrService){}
  canActivate(): Observable<boolean> {
    return this.accountService.currentUser$.pipe(
      map(user => {
        if (user) this.isAuthorized = true;
        if(this.isAuthorized === false){
          console.log(this.isAuthorized);
          this.toastr.error('You shall not pass!');
        } 
        return this.isAuthorized;  
      })
    )
  }  
}
