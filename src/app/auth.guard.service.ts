import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private http: HttpClient, private router: Router) {}
   cartCount: any = 0;

   

  canActivate(): Observable<boolean> {
    // Read raw values from storage and normalize
    const rawUserId = localStorage.getItem('user_id');
    const rawToken = localStorage.getItem('token');

    const userId = rawUserId && rawUserId !== 'null' && rawUserId !== 'undefined' ? rawUserId.trim() : null;
    const token = rawToken && rawToken !== 'null' && rawToken !== 'undefined' ? rawToken.trim() : null;

    console.log('AuthGuard check - userId:', userId, 'token present:', !!token);

    // Allow immediately when both id and token exist locally
    if (userId && token) {
      return of(true);
    }

    // If we have only userId, validate via server using cookies
    if (userId && !token) {
      console.log('AuthGuard: validating user via server (cookies)', { userId });
      const options: any = { withCredentials: true };
      return this.http.get(`https://plangton-production.up.railway.app/api/User/${userId}`, options).pipe(
        map(() => true),
        catchError((err) => {
          console.warn('AuthGuard: server validation failed', err);
          this.router.navigate(['/auth']);
          return of(false);
        })
      );
    }

    // Nothing useful in storage — redirect to login
    console.warn('AuthGuard: no valid auth info in localStorage, redirecting to /auth');
    this.router.navigate(['/auth']);
    return of(false);
  }
                                                    // stop for time
  canActivate2(): Observable<boolean> {
    // Reuse canActivate logic for consistency
    return this.canActivate();
  }

    
    
}