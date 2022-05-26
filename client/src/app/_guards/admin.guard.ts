import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { AccountService } from 'src/app/_services/account.service';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  isAdmin = false;

  constructor(private accountService: AccountService, private toastr: ToastrService,
    private router: Router){}

  canActivate(): Observable<boolean> {
    return this.accountService.currentUser$.pipe(
      map(user => {
        if(user.roles.includes('Admin') || user.roles.includes('Moderator')){
          this.isAdmin = true;
        }
        else {
          this.toastr.error('You cannot enter this area');
          this.router.navigateByUrl('');
        }
        return this.isAdmin;
      })
    )
  }
  
}
