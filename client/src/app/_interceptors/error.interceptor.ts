import { ToastrService } from 'ngx-toastr';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router:Router, private toastr:ToastrService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(error => {
        if(error){
          switch (error.status) {
            case 400:
              const errorsArr = error.error.errors;
              if(errorsArr){
                const modalStateErrors = [];
                for(const key in errorsArr){
                  if(errorsArr[key]){
                    modalStateErrors.push(errorsArr[key]);
                  }
                }
                throw modalStateErrors.flat();
              } else if(typeof(error.error) === 'object') {
                this.toastr.error("Bad Request",error.status);
              }else {
                this.toastr.error(error.error, error.status);
              }
              break;
            case 401:
              this.toastr.error("Unauthorized",error.status)
              break;
            case 404:
              this.router.navigateByUrl('/not-found');
              break;
            case 500:
              const navigationExtras: NavigationExtras = {state: {error: error.error}};
              this.router.navigateByUrl('/server-error',navigationExtras);
              break;      
            default:
              this.toastr.error('Something unexpected went wrong');
              console.log(error);
              break;
              
          }
        }
        return throwError(error);
      })
    );
  }
}
