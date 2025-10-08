import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RefreshService {

  constructor(private http: HttpClient, private router: Router) { }


  refreshAccessToken() {
  this.http.post<any>(
    'https://artshop-backend-demo.fly.dev/auth/refresh',
    {}, // No body needed
    { withCredentials: true }
  ).subscribe({
    next: (res) => {
      // The backend returns a new access_token and sets a new refresh_token cookie
      // If you want, you can store the new access_token in memory or localStorage
      // (if your app uses it for non-httpOnly flows)
      console.log(res);
      
    },
    error: (err) => {
      if (err.error?.error === 'missing_refresh') {
      
      } else {
       
      }
    }
  });
}
}
