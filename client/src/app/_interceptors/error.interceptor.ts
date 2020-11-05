import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { NavigationExtras, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private toastr: ToastrService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError(error => {
        if (!error) return;

        switch (error.status) {
          case 400:
            this.handle(error);
            break;
          case 401:
            this.handle(error);
            break;
          case 404:
            this.router.navigateByUrl('/not-found');
            break;
          case 500:
            const navigationExtras: NavigationExtras = {
              state: { error: error.error }
            };
            this.router.navigateByUrl('/server-error', navigationExtras);
            break;
          default:
            this.toastr.error('Something went wrong');
            console.warn(error);
        }

        return throwError(error);
      })
    );
  }

  private handle(error: any) {
    const errors = error.error?.errors;
    if (errors) {
      const modalStateErrors = [];
      for (const key in errors) {
        if (errors[key]) {
          modalStateErrors.push(...errors[key]);
        }
      }
      throw modalStateErrors;
    }

    if (typeof error.error == 'string') {
      this.toastr.error(error.error);
      return;
    }

    this.toastr.error(this.getStatusText(error.status), error.status);
  }

  private getStatusText(status: number): string {
    switch (status) {
      case 401:
        return 'Unauthorized';
      default:
        return 'OK';
    }
  }
}
