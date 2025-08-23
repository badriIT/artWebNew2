import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-auth',
  standalone: false,
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

  ifRegistering: boolean = false;

  toggleRegistering() {
    this.ifRegistering = !this.ifRegistering;
  }

  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';

  challenge_id!: number;

  otpRequested = false;
  otpCode = '';
  devCode?: string;
  purpose: 'login' | 'register' | 'guest' = 'login';

  constructor(private http: HttpClient) { }

  startOtp() {
    if (!this.email && !this.phone) {
      alert('გთხოვთ შეიყვანოთ ელფოსტა ან ტელეფონი');
      return;
    }

    this.purpose = this.otpRequested ? 'login' : 'register';

    const payload = {
      channel: this.email ? 'email' : 'phone',
      contact: this.email || this.phone,
      purpose: this.purpose
    };
    
    console.log('Starting OTP with payload:', payload);

    this.http.post<any>('https://artshop-backend-demo.fly.dev/auth/otp/start', payload).subscribe({
      next: (res) => {
        console.log('OTP start response:', res);
        this.challenge_id = res.challenge_id;
        this.otpRequested = true;
        if (res.dev_code) {
          this.devCode = res.dev_code;
          console.log('OTP code (dev):', res.dev_code); // <-- log the OTP code for dev/testing
        }
      },
      error: (err) => {
        console.error(err);
        alert('OTP გაგზავნა ვერ მოხერხდა');
      }
    });
  }
  verifyOtp() {
    
    const payload = {
      challenge_id: this.challenge_id,
      code: this.otpCode
    };

    this.http.post<any>('https://artshop-backend-demo.fly.dev/auth/otp/verify', payload).subscribe({
      next: (res) => {
        if (res.access_token) {
          alert('ავტორიზაცია წარმატებით დასრულდა! 🎉');
          localStorage.setItem('access_token', res.access_token);
          console.log('Access Token:', res.access_token); // <-- log access token
        } else if (res.guest_token) {
          alert('გესტის ტოკენი მიღებულია ✅');
          localStorage.setItem('guest_token', res.guest_token);
          console.log('Guest Token:', res.guest_token); // <-- log guest token
        }
      },
      error: (err) => {
        console.error(err);
        alert('OTP ვერ დადასტურდა ❌');
      }
    });
  }

}
