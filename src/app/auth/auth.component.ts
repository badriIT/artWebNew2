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








  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' = 'success';
  showAlert: boolean = false;

  showAnimatedAlert(message: string, type: 'success' | 'error' | 'warning' = 'success', duration: number = 2500) {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;
    setTimeout(() => {
      this.showAlert = false;
    }, duration);
  }









  ngOnInit() {
    this.cartService.updateUnifiedCartCount();
    this.fetchProfile()
  }

  toggleRegistering() {
    this.ifRegistering = !this.ifRegistering;
  }

  /** Step 1: Start registration and request OTP */
  startOtp() {
    if (!this.name || !this.password || (!this.email && !this.phone)) {
      this.showAnimatedAlert(' ⚠️ გთხოვთ შეავსოთ ყველა აუცილებელი ველი', 'warning');
      return;
    }

    // Passwords must match
    if (this.password !== this.confirmPassword) {
    

      return;
      }

    // Password must be at least 8 characters, have 1 number, 1 uppercase letter
    const password = this.password;
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      this.showAnimatedAlert(' ⚠️ პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო, შეიცავდეს ერთ დიდ ასოს და ერთ ციფრს', 'warning');
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
          this.showAnimatedAlert(' ⚠️ ეს მომხმარებელი უკვე არსებობს ან რეგისტრაცია უკვე მიმდინარეობს', 'warning');
        } else {
          this.showAnimatedAlert(' რეგისტრაცია ვერ მოხერხდა ❌', 'error');
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

    const GuestCartToken = localStorage.getItem("cart_token");
    const headers: any = GuestCartToken ? { 'X-Cart-Token': GuestCartToken } : {};

    this.http.post<any>(
      'https://artshop-backend-demo.fly.dev/auth/otp/verify',
      payload,
      { headers, withCredentials: true }
    ).subscribe({
      next: (res) => {
        if (res.guest_token) {
          localStorage.setItem('guest_token', res.guest_token);
          this.showAnimatedAlert('  გესტის ტოკენი მიღებულია ✅', 'success');

        } else {
          alert('ავტორიზაცია წარმატებით დასრულდა 🎉');
          this.showAnimatedAlert('  ავტორიზაცია წარმატებით დასრულდა ✅', 'success');
           
          this.router.navigate(['/personal'])
        }

        // prevent re-use
        this.challenge_id = 0;
        this.otpCode = '';
        this.otpRequested = false;
      },
      error: (err) => {
        if (err.error?.error === 'already_used') {
          this.showAnimatedAlert('❌ OTP უკვე გამოყენებულია, გთხოვთ დაიწყოთ თავიდან', 'error');
        } else if (err.error?.error === 'bad_request') {
          this.showAnimatedAlert('❌ არასწორი OTP კოდი', 'error');
        } else if (err.error?.error === 'invalid_challenge') {
          this.showAnimatedAlert('❌ OTP ვადაგასულია ან არასწორია', 'error');
        } else {
          this.showAnimatedAlert('❌ ვერ მოხერხდა OTP დადასტურება', 'error');
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
        
      }
    });
  }

  login() {
    if (!this.loginUsername || !this.loginPassword) {
      this.showAnimatedAlert(' ⚠️ გთხოვთ შეავსოთ ელ.ფოსტა/ტელეფონი და პაროლი', 'warning');
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
        this.showAnimatedAlert('  შესვლა წარმატებით შესრულდა! ✅', 'success');
        this.fetchProfile();
        setTimeout(() => {
          this.router.navigate(['/personal']);
        }, 3000);
        

      },
      error: (err) => {
        if (err.error?.error === 'invalid_credentials') {
          this.showAnimatedAlert('❌ არასწორი მონაცემები', 'error');
        } else if (err.error?.error === 'account_disabled') {
          this.showAnimatedAlert('❌ ანგარიში დაბლოკილია', 'error');
        } else {
          this.showAnimatedAlert('❌ შესვლა ვერ მოხერხდა', 'error');
        }
      }
    });
  }





}