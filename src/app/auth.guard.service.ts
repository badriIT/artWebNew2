import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private http: HttpClient, private router: Router) {}
   cartCount: any = 0;

   

  canActivate(): Observable<boolean> {
    return this.http.get('https://artshop-backend-demo.fly.dev/auth/profile', { withCredentials: true }).pipe(
      map(() => true), // If profile loads, allow access
      catchError(() => {
        this.router.navigate(['/auth']); // Redirect to auth/login
        return of(false);
      })
    );
  }

  

}