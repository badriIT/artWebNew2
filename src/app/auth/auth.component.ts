import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CartService } from '../cart.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-auth',
  standalone: false,
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent implements OnInit {

  ifRegistering: boolean = false;
  otpRequested = false;

  // new fields
  personalNumber: string = '';
  lastName: string = '';
  username: string = '';


  //

  name: string = '';
  email: string = '';
  phone: string = '';
  password = '';
  confirmPassword = '';

  challenge_id!: number;
  otpCode = '';
  devCode?: string;


  responseAfterRegister: any;

  // Normalize various backend shapes for id/token
  private normalizeLoginResponse(res: any) {
    const id = res?.id ?? res?.user?.id ?? res?.data?.id ?? res?.userId ?? res?.user_id ?? res?.accountId ?? null;
    const token = res?.token ?? res?.access_token ?? res?.jwt ?? res?.data?.token ?? res?.data?.access_token ?? res?.auth_token ?? null;
    return { id, token };
  }

  constructor(private http: HttpClient, private cartService: CartService, private router: Router,) { }

  ngOnInit() { }


  returnToLogin() {
    this.ifRegistering = !this.ifRegistering;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }




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

  toggleRegistering() {
    this.ifRegistering = !this.ifRegistering;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  isValidEmail(email: string): boolean {
    if (!email) return true; // Allow empty email if phone is provided

    // Check if @ symbol exists
    if (!email.includes('@')) {
      return false;
    }

    // Comprehensive email regex pattern
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(email)) {
      return false;
    }

    // Check for valid domain extensions
    const validExtensions = ['.com', '.net', '.org', '.edu', '.gov', '.ru', '.ge', '.uk', '.de', '.fr', '.it', '.es', '.ca', '.au', '.jp', '.cn', '.br', '.in', '.io', '.co', '.us', '.info', '.biz', '.me', '.app', '.dev'];
    const hasValidExtension = validExtensions.some(ext => email.toLowerCase().endsWith(ext));

    return hasValidExtension;
  }

  Register() {

    if (!this.name || !this.password || (!this.email && !this.phone) || !this.personalNumber || !this.lastName || !this.username) {
      console.log('Validation failed: missing required fields');
      this.showAnimatedAlert(' ⚠️ გთხოვთ შეავსოთ ყველა აუცილებელი ველი', 'warning');
      return;
    } else if (this.password !== this.confirmPassword) {
      console.log('Validation failed: passwords do not match');
      this.showAnimatedAlert(' ⚠️ პაროლები არ ემთხვევა', 'warning');
      return;
    }

    // Email validation
    if (this.email && !this.isValidEmail(this.email)) {
      console.log('Validation failed: invalid email format');
      this.showAnimatedAlert(' ⚠️ არასწორი ელ.ფოსტის ფორმატი', 'warning');
      return;
    }


    const payload = {

      personalNumber: this.personalNumber,
      firstName: this.name,
      lastName: this.lastName,
      username: this.username,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      mobileNumber: this.phone,
    };

    console.log('Registration payload:', payload);

    this.http.post<any>('https://plangton-production.up.railway.app/api/Auth/Register', payload).subscribe({
      next: (res) => {

        this.showAnimatedAlert('  რეგისტრაცია წარმატებით შესრულდა! ✅', 'success');

        console.log('Registration successful, res', res);

        setTimeout(() => {
          this.router.navigate(['/auth']);
          window.location.reload();

        }, 3000);


      },
      error: (err) => {
        console.error('Registration error:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.error);
        this.showAnimatedAlert('❌ რეგისტრაცია ვერ მოხერხდა', 'error');
      }
    });
  }


  /** Step 1: Start registration and request OTP */
  // startOtp() {
  //   if (!this.name || !this.password || (!this.email && !this.phone)) {
  //     this.showAnimatedAlert(' ⚠️ გთხოვთ შეავსოთ ყველა აუცილებელი ველი', 'warning');
  //     return;
  //   }

  //   // Passwords must match
  //   if (this.password !== this.confirmPassword) {


  //     return;
  //   }

  //   // Password must be at least 8 characters, have 1 number, 1 uppercase letter
  //   const password = this.password;
  //   if (
  //     password.length < 8 ||
  //     !/[A-Z]/.test(password) ||
  //     !/[0-9]/.test(password)
  //   ) {
  //     this.showAnimatedAlert(' ⚠️ პაროლი უნდა იყოს მინიმუმ 8 სიმბოლო, შეიცავდეს ერთ დიდ ასოს და ერთ ციფრს', 'warning');
  //     return;
  //   }

  //   const language = localStorage.getItem('preferredLanguage') || 'ka';

  //   const payload = {
  //     lang: language,
  //     name: this.name,
  //     password: this.password,
  //     username: this.email || this.phone // backend expects "username"
  //   };

  //   console.log('Registration payload:', payload);

  //   this.http.post<any>(
  //     'https://artshop-backend-demo.fly.dev/auth/register',
  //     payload,
  //     { withCredentials: true }
  //   ).subscribe({
  //     next: (res) => {
  //       this.challenge_id = res.challenge_id;

  //       console.log('OTP requested, res', res);

  //       if (res.dev_code) {
  //         this.devCode = res.dev_code;
  //       }

  //       this.otpRequested = true; // Only set here, after success!
  //     },
  //     error: (err) => {
  //       if (err.status === 403) {
  //         this.showAnimatedAlert(' ⚠️ ეს მომხმარებელი უკვე არსებობს ან რეგისტრაცია უკვე მიმდინარეობს', 'warning');
  //       } else {
  //         this.showAnimatedAlert(' რეგისტრაცია ვერ მოხერხდა ❌', 'error');
  //       }
  //     }
  //   });
  // }

  // /** Step 2: Verify OTP */
  // verifyOtp() {
  //   if (!this.otpCode || !this.challenge_id) {
  //     this.showAnimatedAlert(' გთხოვთ შეიყვანოთ OTP კოდი ❌', 'warning');

  //     return;
  //   }

  //   const payload = {
  //     challenge_id: this.challenge_id,
  //     code: this.otpCode.trim()
  //   };

  //   const GuestCartToken = localStorage.getItem("cart_token");
  //   const headers: any = GuestCartToken ? { 'X-Cart-Token': GuestCartToken } : {};

  //   this.http.post<any>(
  //     'https://artshop-backend-demo.fly.dev/auth/otp/verify',
  //     payload,
  //     { headers, withCredentials: true }
  //   ).subscribe({
  //     next: (res) => {
  //       if (res.guest_token) {
  //         localStorage.setItem('guest_token', res.guest_token);
  //         this.showAnimatedAlert('  გესტის ტოკენი მიღებულია ✅', 'success');

  //       } else {

  //         this.showAnimatedAlert('  ავტორიზაცია წარმატებით დასრულდა ✅', 'success');

  //         setTimeout(() => {
  //           this.router.navigate(['/personal']);
  //         }, 3000);
  //       }

  //       // prevent re-use
  //       this.challenge_id = 0;
  //       this.otpCode = '';
  //       this.otpRequested = false;
  //     },
  //     error: (err) => {
  //       if (err.error?.error === 'already_used') {
  //         this.showAnimatedAlert('❌ OTP უკვე გამოყენებულია, გთხოვთ დაიწყოთ თავიდან', 'error');
  //       } else if (err.error?.error === 'bad_request') {
  //         this.showAnimatedAlert('❌ არასწორი OTP კოდი', 'error');
  //       } else if (err.error?.error === 'invalid_challenge') {
  //         this.showAnimatedAlert('❌ OTP ვადაგასულია ან არასწორია', 'error');
  //       } else {
  //         this.showAnimatedAlert('❌ ვერ მოხერხდა OTP დადასტურება', 'error');
  //       }
  //     }
  //   });
  // }

  loginUsername = '';
  loginPassword = '';

  profile: any = null;
  profileArray: { key: string, value: any }[] = [];

  fetchProfile() {
    // No need to send access token manually, just use withCredentials

    // Guard: ensure we have a response with an id before requesting profile



    // and include Authorization header if we saved a token during login.
    // If we have a bearer token use it and DO NOT send credentials (avoids CORS wildcard issues).
    // If no token is present, fall back to sending cookies via withCredentials (may require server CORS change).
    const savedToken = this.responseAfterRegister?.token; // Adjust based on actual response structure
    const headers = savedToken ? new HttpHeaders({ 'Authorization': `Bearer ${savedToken}` }) : undefined;
    const options: any = headers ? { headers } : { withCredentials: true };





    this.http.get<any>(
      `https://plangton-production.up.railway.app/api/User/${this.responseAfterRegister.id}`,  // I AM HERE
      options,
    ).subscribe({
      next: (res) => {
        this.profile = res;

        // Flatten the profile and stats into an array



        console.log('Profile:', res);
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

      mail: this.loginUsername,
      password: this.loginPassword
    };

    // Optional: merge guest cart if token exists


    this.http.post<any>(
      'https://plangton-production.up.railway.app/api/Auth/Login',
      payload,

    ).subscribe({
      next: (res) => {

        console.log('Login successful, res', res);

        // save response first, then fetch profile
        this.responseAfterRegister = res;

        // Normalize and persist id/token from many possible response shapes
        const extracted = this.normalizeLoginResponse(res);


        if (extracted.id) {
          localStorage.setItem('user_id', String(extracted.id));
          try { this.responseAfterRegister.id = extracted.id; } catch { }
        }

        if (extracted.token) {
          localStorage.setItem('token', extracted.token);
          try { this.responseAfterRegister.token = extracted.token; } catch { }
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