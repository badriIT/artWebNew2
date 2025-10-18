import { Component, OnInit } from '@angular/core';
import { AuthGuard } from '../auth.guard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GetProductInfoService } from '../get-product-info.service';

@Component({
  selector: 'app-pre-order-details',
  standalone: false,
  templateUrl: './pre-order-details.component.html',
  styleUrl: './pre-order-details.component.css'
})
export class PreOrderDetailsComponent implements OnInit {



  //
  CartToken: string | null = null;
  existCartToken: boolean = false;
  //



  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' = 'success';
  showAlert: boolean = false;
  address = '';
  phone = '';
  authenticated: boolean = false;
  isCheckingAuth: boolean = true;

  // OTP
  challengeId: number | string | null = null;
  showCodeInput: boolean = false;
  otpCode: string = '';
  isVerifying: boolean = false;
  errorMessage: string | null = null;

  productId: string = '';

  byId: boolean = false; // for template use

  constructor(
    private CheckAuthService: AuthGuard,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private getProductInfoService: GetProductInfoService
  ) { }

  ngOnInit(): void {
    // read product id from service first, then route params / query
    const fromService = this.getProductInfoService.productID || '';
    const fromRoute = this.route.snapshot.paramMap.get('id') ?? this.route.snapshot.queryParamMap.get('productId') ?? '';
    this.productId = fromService || fromRoute;
    console.log('Pre-order: productId resolved ->', { fromService, fromRoute, final: this.productId });
    if (this.productId || this.CartToken ) {
      this.byId = true;
    }
    else {
      this.byId = false;
      
    } 

    // check auth status

    this.CheckAuthService.canActivate2().subscribe({
      next: (isAuth) => {
        this.authenticated = !!isAuth;
        this.isCheckingAuth = false;
      },
      error: () => {
        this.authenticated = false;
        this.isCheckingAuth = false;
      }
    });

    this.CartToken = this.getProductInfoService.CartToken;

    if (this.CartToken) {
      this.existCartToken = true;
      console.log('Cart token exists:', this.CartToken);
    } else {
      this.existCartToken = false;
    }
  }

  private showAnimatedAlert(message: string, type: 'success' | 'error' | 'warning' = 'success', duration = 2500) {
    this.alertMessage = message; this.alertType = type; this.showAlert = true;
    setTimeout(() => this.showAlert = false, duration);
  }

  // ensure we use the latest service value before payload
  private resolveProductId() {
    this.productId = this.getProductInfoService.productID || this.productId;
    console.log('resolveProductId ->', this.productId);
    return this.productId;
  }


  verifyWhenAuthenticated() {
    const id = this.resolveProductId();
    if (!id) {
      this.showAnimatedAlert('პროდუქტის ID არ არის მითითებული', 'error');

      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1000);
      return;
    }



    if (!this.address) {

      this.showAnimatedAlert(' ⚠️ გთხოვთ შეიყვანოთ მიწოდების მისამართი', 'warning');
    } else {

      this.showAnimatedAlert('მიმდინარეობს შეკვეთის დამუშავება...', 'success', 3000);

      const payload = { item_id: id, address: this.address }; // adress can be added to payload if backend supports it
      console.log('Quick buy payload (auth):', payload);

      this.http.post<any>(
        'https://artshop-backend-demo.fly.dev/checkout/quick',
        payload,
        { withCredentials: true }
      ).subscribe({
        next: (res) => {
          console.log('Quick buy response:', res);
          if (res.order?.payment_url) {
            window.location.href = res.order.payment_url;
          } else {
            this.showAnimatedAlert('Order created! Order ID: ' + (res.order?.order_id ?? ''), 'success');
          }
        },
        error: (err) => {
          console.error('Quick buy error:', err);
          this.showAnimatedAlert(`შეკვეთის განხორციელება ვერ მოხერხდა: ${err.error?.error || 'unknown error'}`, 'error');
        }
      });
    }




  }

















  verifyWhenNotAuthenticated() {
    const id = this.resolveProductId();
    if (!id) {
      this.showAnimatedAlert('პროდუქტის ID არ არის მითითებული', 'error');

      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1000);

      return;
    }

    const language = localStorage.getItem('language') || 'ka';


    const payloadForOtp = {
      lang: language,
      channel: "phone",
      contact: this.phone,
      purpose: "checkout"
    }

    if (!this.address || !this.phone) {
      this.showAnimatedAlert(' ⚠️ გთხოვთ შეიყვანოთ მისამართი და ტელეფონის ნომერი', 'warning');
      return;
    }


    this.http.post<any>(
      'https://artshop-backend-demo.fly.dev/auth/otp/start',
      payloadForOtp,

    ).subscribe({
      next: (res) => {
        this.challengeId = res.challenge_id;
        this.showCodeInput = true;
        this.showAnimatedAlert('OTP კოდი გაგზავნილია', 'success');
      }
      ,
      error: (err) => {
        console.error('OTP start error:', err);
        this.showAnimatedAlert(`OTP კოდის გაგზავნა ვერ მოხერხდა: ${err.error?.error || 'unknown error'}`, 'error');
      }
    });













    const payload = { item_id: id, address: this.address }; // adress can be added to payload if backend supports it
    console.log('Quick buy payload (guest):', payload);

    this.http.post<any>(
      'https://artshop-backend-demo.fly.dev/checkout/quick',
      payload,
      { withCredentials: true }
    ).subscribe({
      next: (res) => {
        console.log('Quick buy response:', res);
        if (res.order?.payment_url) {
          window.location.href = res.order.payment_url;
        } else {
          this.showAnimatedAlert('Order created! Order ID: ' + (res.order?.order_id ?? ''), 'success');
        }
      },
      error: (err) => {
        console.error('Quick buy error:', err);
        this.showAnimatedAlert(`შეკვეთის განხორციელება ვერ მოხერხდა: ${err.error?.error || 'unknown error'}`, 'error');
      }
    });
  }






  // OTP verify method unchanged (keeps existing behavior)
  verifyOtpForCheckout() {
    if (!this.challengeId) { this.errorMessage = 'Challenge id missing. Restart verification.'; return; }
    if (!this.otpCode) { this.errorMessage = 'გთხოვთ შეიყვანოთ კოდი'; return; }

    this.isVerifying = true; this.errorMessage = null;
    const payload = { challenge_id: this.challengeId, code: this.otpCode };
    const cartToken = localStorage.getItem('cart_token') || null;
    let headers = new HttpHeaders();
    if (cartToken) headers = headers.set('X-Cart-Token', cartToken);

    this.http.post<any>('https://artshop-backend-demo.fly.dev/auth/otp/verify', payload, { headers, withCredentials: true }).subscribe({
      next: (res) => {
        console.log('OTP verify success', res);
        if (res?.guest_token) try { localStorage.setItem('guest_token', res.guest_token); } catch { }
        if (res?.cart_token) try { localStorage.setItem('cart_token', res.cart_token); } catch { }
        this.showCodeInput = false; this.isVerifying = false; this.otpCode = '';
        this.showAnimatedAlert('ვერიფიკაცია წარმატებით დასრულდა', 'success');
      },
      error: (err) => {
        console.error('OTP verify error', err);
        this.isVerifying = false;
        if (err?.status === 400) this.errorMessage = err?.error?.error || 'არასწორი კოდი.';
        else if (err?.status === 404) this.errorMessage = 'ჩელენჯი ვერ მოიძებნა. გთხოვთ დაიწყეთ პროცესი თავიდან.';
        else if (err?.status === 429) this.errorMessage = 'ბევრი მცდელობა. სცადეთ მოგვიანებით.';
        else this.errorMessage = 'ვერიფიკაცია ვერ მოხერხდა. სცადეთ თავიდან.';
        this.showAnimatedAlert(this.errorMessage || 'Verification failed', 'error');
      }
    });
  }






  buyingFromCartNotRegistered() {
    

  }

}
