import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { CartService } from '../cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: false,
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

  ifRegistering: boolean = false;
  otpRequested = false;

  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';

  challenge_id!: number;
  otpCode = '';
  devCode?: string;

  constructor(private http: HttpClient, private cartService: CartService, private router: Router) { }

  ngOnInit() {
    this.cartService.updateCartCount();
    this.fetchProfile()
  }

  toggleRegistering() {
    this.ifRegistering = !this.ifRegistering;
  }

  /** Step 1: Start registration and request OTP */
  startOtp() {
    if (!this.name || !this.password || (!this.email && !this.phone)) {
      alert('გთხოვთ შეავსოთ ყველა აუცილებელი ველი');
      return;
    }

    // Passwords must match
    if (this.password !== this.confirmPassword) {
      alert('პაროლები არ ემთხვევა');
      return;
    }

    // Password must be at least 8 characters, have 1 number, 1 uppercase letter
    const password = this.password;
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      alert('პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო, შეიცავდეს ერთ დიდ ასოს და ერთ ციფრს');
      return;
    }

    const payload = {
      name: this.name,
      password: this.password,
      username: this.email || this.phone // backend expects "username"
    };

    this.http.post<any>(
      'https://artshop-backend-demo.fly.dev/auth/register',
      payload,
      { withCredentials: true }
    ).subscribe({
      next: (res) => {
        this.challenge_id = res.challenge_id;

        if (res.dev_code) {
          this.devCode = res.dev_code;
        }

        this.otpRequested = true; // Only set here, after success!
      },
      error: (err) => {
        if (err.status === 403) {
          alert('ეს მომხმარებელი უკვე არსებობს ან რეგისტრაცია უკვე მიმდინარეობს');
        } else {
          alert('რეგისტრაცია ვერ მოხერხდა ❌');
        }
      }
    });
  }

  /** Step 2: Verify OTP */
  verifyOtp() {
    if (!this.otpCode || !this.challenge_id) {
      alert('გთხოვთ შეიყვანოთ OTP კოდი');
      return;
    }

    const payload = {
      challenge_id: this.challenge_id,
      code: this.otpCode.trim()
    };

    this.http.post<any>(
      'https://artshop-backend-demo.fly.dev/auth/otp/verify',
      payload,
      { withCredentials: true }
    ).subscribe({
      next: (res) => {
        if (res.guest_token) {
          localStorage.setItem('guest_token', res.guest_token);
          alert('გესტის ტოკენი მიღებულია ✅');
        } else {
          alert('ავტორიზაცია წარმატებით დასრულდა 🎉');
          this.router.navigate(['/personal'])
        }

        // prevent re-use
        this.challenge_id = 0;
        this.otpCode = '';
        this.otpRequested = false;
      },
      error: (err) => {
        if (err.error?.error === 'already_used') {
          alert('❌ OTP უკვე გამოყენებულია, გთხოვთ დაიწყოთ თავიდან');
        } else if (err.error?.error === 'bad_request') {
          alert('❌ არასწორი OTP კოდი');
        } else if (err.error?.error === 'invalid_challenge') {
          alert('❌ OTP ვადაგასულია ან არასწორია');
        } else {
          alert('ვერ მოხერხდა OTP დადასტურება');
        }
      }
    });
  }

  loginUsername = '';
  loginPassword = '';

  profile: any = null;
  profileArray: { key: string, value: any }[] = [];

  fetchProfile() {
    // No need to send access token manually, just use withCredentials
    this.http.get<any>(
      'https://artshop-backend-demo.fly.dev/auth/profile',
      { withCredentials: true }
    ).subscribe({
      next: (res) => {
        this.profile = res;

        // Flatten the profile and stats into an array
        this.profileArray = [
          { key: 'სახელი', value: res.customer?.name },
          { key: 'ელ.ფოსტა', value: res.customer?.email },
          { key: 'ტელეფონი', value: res.customer?.phone },
          { key: 'აქტიურია', value: res.customer?.is_active ? 'დიახ' : 'არა' },
          { key: 'ბოლო ავტორიზაცია', value: res.customer?.last_login_at },
          { key: 'შეკვეთების რაოდენობა', value: res.stats?.orders_count },
          { key: 'ფავორიტების რაოდენობა', value: res.stats?.favorites_count },
          { key: 'ღია კალათები', value: res.stats?.carts_open_count }
        ];
        console.log('Profile:', this.profileArray);
      },
      error: (err) => {
        alert('პროფილის მიღება ვერ მოხერხდა');
      }
    });
  }

  login() {
    if (!this.loginUsername || !this.loginPassword) {
      alert('გთხოვთ შეავსოთ ელ.ფოსტა/ტელეფონი და პაროლი');
      return;
    }

    const payload = {
      password: this.loginPassword,
      username: this.loginUsername
    };

    // Optional: merge guest cart if token exists
    const guestCartToken = localStorage.getItem('cart_token');
    const headers: any = guestCartToken
      ? { 'X-Cart-Token': guestCartToken }
      : {};

    this.http.post<any>(
      'https://artshop-backend-demo.fly.dev/auth/login',
      payload,
      { headers, withCredentials: true }
    ).subscribe({
      next: (res) => {
        if (res.cart_token) {
          localStorage.setItem('cart_token', res.cart_token);
        }
        alert('შესვლა წარმატებით შესრულდა!');
        this.fetchProfile();
        this.router.navigate(['/personal'])
        
      },
      error: (err) => {
        if (err.error?.error === 'invalid_credentials') {
          alert('არასწორი მონაცემები');
        } else if (err.error?.error === 'account_disabled') {
          alert('ანგარიში დაბლოკილია');
        } else {
          alert('შესვლა ვერ მოხერხდა');
        }
      }
    });
  }


   


}