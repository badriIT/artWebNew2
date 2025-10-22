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


  ////////////// helpers

  allowDigits(event: KeyboardEvent) {
    const key = event.key;
    const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];
    if (controlKeys.includes(key)) return;
    // block if not single digit 1-9
    if (!/^[1-9]$/.test(key)) {
      event.preventDefault();
    }
  }

  // sanitize pasted content to digits 1-9 only
  onPaste(e: ClipboardEvent) {
    const pasted = e.clipboardData?.getData('text') ?? '';
    const filtered = pasted.replace(/[^1-9]/g, '');
    if (filtered !== pasted) {
      // prevent default paste and insert filtered text manually
      e.preventDefault();
      const target = e.target as HTMLInputElement | null;
      if (!target) return;
      const start = target.selectionStart ?? target.value.length;
      const end = target.selectionEnd ?? target.value.length;
      const newVal = target.value.slice(0, start) + filtered + target.value.slice(end);
      target.value = newVal;
      // notify Angular/forms about the change
      target.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }



  ///////////////



  // Component state
  CartToken: string | null = null;
  existCartToken: boolean = false;
  //

  // User input fields
  address = '';
  phone = '';
  recipientName = '';
  city = "";
  postalCode = '';
  //


  // Alert state
  alertMessage: string = '';
  alertType: 'success' | 'error' | 'warning' = 'success';
  showAlert: boolean = false;
  //

  // Authentication state
  authenticated: boolean = false;
  isCheckingAuth: boolean = true;
  userName: string = '';
  authResponse: any = null;
  //

  // OTP
  challengeId: number | string | null = null;
  showCodeInput: boolean = false;
  otpCode: string = '';
  isVerifying: boolean = false;
  errorMessage: string | null = null;

  productId: string = '';

  byId: boolean = false; // for template use

  // Constructor 
  constructor(
    private CheckAuthService: AuthGuard,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private getProductInfoService: GetProductInfoService
  ) { }


  // On component init
  ngOnInit(): void {
    // read product id from service first, then route params / query
    const fromService = this.getProductInfoService.productID || '';
    const fromRoute = this.route.snapshot.paramMap.get('id') ?? this.route.snapshot.queryParamMap.get('productId') ?? '';
    this.productId = fromService || fromRoute;
    console.log('Pre-order: productId resolved ->', { fromService, fromRoute, final: this.productId });

    this.CartToken = this.getProductInfoService.CartToken;

    if (this.CartToken) {
      this.existCartToken = true;
    }

    if (this.productId) {
      this.byId = true;
    }

    if (!this.productId && !this.CartToken) {
      this.router.navigate(['/']);
    }

    // check auth status

    this.CheckAuthService.canActivate2().subscribe({
      next: (res) => {
        console.log('Auth check response:', res);
        this.authenticated = !!res;
        this.authResponse = res;
        this.isCheckingAuth = false;

      },
      error: (err) => {
        console.error('Auth check error:', err);
        this.authenticated = false;
        this.isCheckingAuth = false;
      }
    });

    this.http.get('https://artshop-backend-demo.fly.dev/auth/profile', { withCredentials: true }).subscribe({
      next: (res: any) => {
        
        this.userName = res?.customer?.name ?? res?.name ?? res?.username ?? '';
     

     
        this.recipientName = this.userName || '';
      },
      error: (err) => {
        console.error('User profile fetch error:', err);
      }
    });

  }

  // Clean up on destroy
  ngOnDestroy(): void {
    // clear component state
    this.productId = '';
    this.CartToken = null;
    this.existCartToken = false;
    this.byId = false;

    // also clear shared service values so other pages won't reuse them
    try {
      this.getProductInfoService.productID = '';
      this.getProductInfoService.CartToken = null;
    } catch (e) {
      // ignore if service shape differs
      console.warn('Failed to clear GetProductInfoService tokens', e);
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

  // Method for authenticated users

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  verifyWhenAuthenticated() {
    const id = this.resolveProductId();
    if (!id) {
      this.showAnimatedAlert('პროდუქტის ID არ არის მითითებული', 'error');

      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1000);
      return;
    }







    if (!this.address || !this.city || !this.postalCode || !this.recipientName) {
      this.showAnimatedAlert('⚠️ გთხოვთ შეავსოთ ყველა საჭირო ველი მიწოდებისთვის', 'warning');
      return;
    } else {

      this.showAnimatedAlert('მიმდინარეობს შეკვეთის დამუშავება...', 'success', 3000);

      const payload = {
        address_line1: this.address,
        city: this.city,
        item_id: this.productId,
        postal_code: this.postalCode,
        recipient_name: this.recipientName,

      };
      console.log('Quick buy payload (auth):', payload);

      this.http.post<any>(
        'https://artshop-backend-demo.fly.dev/checkout/quick',
        payload,
        { withCredentials: true }
      ).subscribe({
        next: (res) => {
          console.log('Quick buy response:', res);
          const payUrl = res?.payment_url ?? res?.order?.payment_url ?? res?.payment?.payment_url;
          if (payUrl) {
            window.location.href = payUrl;
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




  } ////////////////////////////////////////////////////////////////////////////////////////////////////////
















  // Method for non-authenticated users
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

    if (!this.phone || !this.address || !this.city || !this.postalCode || !this.recipientName) {
      this.showAnimatedAlert('⚠️ გთხოვთ შეავსოთ ყველა საჭირო ველი მიწოდებისთვის', 'warning');
      return;
    }


    this.http.post<any>(
      'https://artshop-backend-demo.fly.dev/auth/otp/start',
      payloadForOtp,

    ).subscribe({
      next: (res) => {
        this.challengeId = res.challenge_id;
        this.showCodeInput = true;
        console.log("პასუხი OTP დაწყებისას:", res);
        this.showAnimatedAlert('OTP კოდი გაგზავნილია', 'success');
      }
      ,
      error: (err) => {
        console.error('OTP start error:', err);
        this.showAnimatedAlert(`OTP კოდის გაგზავნა ვერ მოხერხდა: ${err.error?.error || 'unknown error'}`, 'error');
      }
    });













  }






  // OTP verify method for checkout
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

        this.showCodeInput = false; this.isVerifying = false; this.otpCode = '';
        this.showAnimatedAlert('მიმდინარეობს შეკვეთის დამუშავება...', 'success');


        if (res) {

        }



        const guest_token = res.guest_token



        let headers = new HttpHeaders();
        if (guest_token) headers = headers.set('X-Guest-Token', guest_token);



        const payload = {
          address_line1: this.address,
          city: this.city,
          item_id: this.productId,

          recipient_name: this.recipientName,

          postal_code: this.postalCode,
          phone: this.phone
        }


        this.http.post<any>(
          'https://artshop-backend-demo.fly.dev/checkout/quick',
          payload,
          { headers, withCredentials: true }

        ).subscribe({
          next: (res) => {
            console.log('Quick buy response:', res);
            const payUrl = res?.payment_url ?? res?.order?.payment_url ?? res?.payment?.payment_url;
            if (payUrl) {
              window.location.href = payUrl;
            } else {
              this.showAnimatedAlert('Order created! Order ID: ' + (res.order?.order_id ?? ''), 'success');
            }
          },
          error: (err) => {
            console.error('Quick buy error:', err);
            this.showAnimatedAlert(`შეკვეთის განხორციელება ვერ მოხერხდა: ${err.error?.error || 'unknown error'}`, 'error');
          }
        });

        //


      },
      error: (err) => {
        console.error('OTP verify error', err);
        this.isVerifying = false;
        if (err?.status === 400) this.errorMessage = err?.error?.error || 'არასწორი კოდი.';
        else if (err?.status === 404) this.errorMessage = 'ჩელენჯი ვერ მოიძებნა. გთხოვთ დაიწყეთ პროცესი თავიდან.';
        else if (err?.status === 429) this.errorMessage = 'ბევრი მცდელობა. სცადეთ მოგვიანებით.';
        else this.errorMessage = 'შეკვეთის დამუშავება ვერ მოხერხდა. სცადეთ თავიდან.';
        this.showAnimatedAlert(this.errorMessage || 'Verification failed', 'error');
      }
    });
  }





  // For future use
  buyingFromCartNotRegistered() {

    const CartToken = this.CartToken
    if (!CartToken) {
      this.showAnimatedAlert('Cart token is missing', 'error');

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
        console.log("პასუხი OTP დაწყებისას:", res);
        this.showAnimatedAlert('OTP კოდი გაგზავნილია', 'success');
      }
      ,
      error: (err) => {
        console.error('OTP start error:', err);
        this.showAnimatedAlert(`OTP კოდის გაგზავნა ვერ მოხერხდა: ${err.error?.error || 'unknown error'}`, 'error');
      }
    });











    let headers = new HttpHeaders();
    headers = headers.set('X-Cart-Token', CartToken);

    const payload = {

      address_line1: this.address,
      recipient_name: this.recipientName,
      city: this.city,
      postal_code: this.postalCode
    }
    console.log('Quick buy payload (guest):', payload);




  }




  verifyOtpForCheckoutFromCart() {
    if (!this.challengeId) {
      this.errorMessage = 'Challenge id missing. Restart verification.';
      return;
    }
    if (!this.otpCode) {
      this.errorMessage = 'გთხოვთ შეიყვანოთ კოდი';
      return;
    }

    this.isVerifying = true;
    this.errorMessage = null;

    const payload = {
      challenge_id: this.challengeId,
      code: this.otpCode
    };

    const cartToken = localStorage.getItem('cart_token') || null;
    let headers = new HttpHeaders();
    if (cartToken) headers = headers.set('X-Cart-Token', cartToken);

    // Step 1: Verify OTP
    this.http.post<any>(
      'https://artshop-backend-demo.fly.dev/auth/otp/verify',
      payload,
      { headers, withCredentials: true }
    ).subscribe({
      next: (res) => {
        console.log('OTP verify success', res);

        this.showCodeInput = false;
        this.isVerifying = false;
        this.otpCode = '';

        this.showAnimatedAlert('მიმდინარეობს შეკვეთის დამუშავება...', 'success');

        const guest_token = res.guest_token;
        if (!guest_token) {
          this.showAnimatedAlert('Guest token not received. Retry verification.', 'error');
          return;
        }

        // Step 2: Create order from cart
        let orderHeaders = new HttpHeaders();
        if (cartToken) orderHeaders = orderHeaders.set('X-Cart-Token', cartToken);
        orderHeaders = orderHeaders.set('X-Guest-Token', guest_token);

        const orderPayload = {
          address_line1: this.address,
          city: this.city,

          recipient_name: this.recipientName,
          postal_code: this.postalCode,
          phone: this.phone,

        };

        this.http.post<any>(
          'https://artshop-backend-demo.fly.dev/checkout/create',
          orderPayload,
          { headers: orderHeaders, withCredentials: true }
        ).subscribe({
          next: (orderRes) => {
            console.log('Checkout create response:', orderRes);
            const payUrl = orderRes?.payment_url ?? orderRes?.order?.payment_url ?? orderRes?.payment?.payment_url;
            if (payUrl) {
              window.location.href = payUrl;
            } else {
              this.showAnimatedAlert('შეკვეთა წარმატებით განხორციელდა! Order ID: ' + (orderRes.order?.order_id ?? ''), 'success');
            }
          },
          error: (err) => {
            console.error('Checkout create error:', err);
            this.showAnimatedAlert(`შეკვეთის განხორციელება ვერ მოხერხდა: ${err.error?.error || 'unknown error'}`, 'error');
          }
        });
      },
      error: (err) => {
        console.error('OTP verify error', err);
        this.isVerifying = false;
        if (err?.status === 400) this.errorMessage = err?.error?.error || 'არასწორი კოდი.';
        else if (err?.status === 404) this.errorMessage = 'ჩელენჯი ვერ მოიძებნა. გთხოვთ დაიწყეთ პროცესი თავიდან.';
        else if (err?.status === 429) this.errorMessage = 'ბევრი მცდელობა. სცადეთ მოგვიანებით.';
        else this.errorMessage = 'შეკვეთის დამუშავება ვერ მოხერხდა. სცადეთ თავიდან.';
        this.showAnimatedAlert(this.errorMessage || 'Verification failed', 'error');
      }
    });
  }





  buyingFromCartRegistered() {
    const cartToken = localStorage.getItem('cart_token');
    const accessToken = localStorage.getItem('access_token');



    if (!cartToken) {
      this.showAnimatedAlert('კალათის მისამართი არ არის მითითებული', 'error');
      setTimeout(() => this.router.navigate(['/']), 1000);
      return;
    }


    if (!this.address || !this.city || !this.postalCode || !this.recipientName) {
      this.showAnimatedAlert('⚠️ გთხოვთ შეავსოთ ყველა საჭირო ველი მიწოდებისთვის', 'warning');
      return;
    }

    this.showAnimatedAlert('მიმდინარეობს შეკვეთის დამუშავება...', 'success', 3000);

    // ✅ Headers for registered user checkout
    let headers = new HttpHeaders()

      .set('X-Cart-Token', cartToken);

    // ✅ Delivery payload (required by API)
    const payload = {
      address_line1: this.address,
      city: this.city,

      phone: this.phone,
      postal_code: this.postalCode,
      recipient_name: this.recipientName,

    };

    // ✅ Create order from cart
    this.http.post<any>(
      'https://artshop-backend-demo.fly.dev/checkout/create',
      payload,
      { headers, withCredentials: true }
    ).subscribe({
      next: (res) => {
        console.log('Checkout create response:', res);
        const payUrl = res?.payment_url ?? res?.order?.payment_url ?? res?.payment?.payment_url;
        if (payUrl) {
          window.location.href = payUrl;
        } else {
          this.showAnimatedAlert('შეკვეთა წარმატებით განხორციელდა! Order ID: ' + (res.order?.order_id ?? ''), 'success');
        }
      },
      error: (err) => {
        console.error('Checkout create error:', err);
        this.showAnimatedAlert(`შეკვეთის განხორციელება ვერ მოხერხდა: ${err.error?.error || 'unknown error'}`, 'error');
      }
    });
  }
}