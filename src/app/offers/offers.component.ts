import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-offers',
  standalone: false,
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.css'
})
export class OffersComponent {


  profileName = '';
  profileEmail = '';
  profilePhone = '';


  profile: any = null;
  profileArray: { key: string, value: any }[] = [];


  sideMenuOpen = false;

  products: any[] = [];

  // Alert properties




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


  // Carousel properties

  carouselIndex = 0;

  // Animation state
  nextProductData: any = null;
  isAnimating = false;
  direction: 'left' | 'right' = 'right';
  animateIn = false;

  get currentProduct() {
    return this.products[this.carouselIndex];
  }

  nextProduct() {
    if (this.isAnimating || this.products.length === 0) return;
    const newIndex = this.carouselIndex === this.products.length - 1 ? 0 : this.carouselIndex + 1;
    this.direction = 'right';
    this.nextProductData = this.products[newIndex];
    this.startTransition(newIndex);
  }

  prevProduct() {
    if (this.isAnimating || this.products.length === 0) return;
    const newIndex = this.carouselIndex === 0 ? this.products.length - 1 : this.carouselIndex - 1;
    this.direction = 'left';
    this.nextProductData = this.products[newIndex];
    this.startTransition(newIndex);
  }

  private startTransition(newIndex: number) {
    this.isAnimating = true;
    this.animateIn = false;

    // Wait one frame, then start animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.animateIn = true;
      });
    });


    // Wait for CSS transition to finish before updating state
    setTimeout(() => {

      this.carouselIndex = newIndex;
      this.nextProductData = null;
      this.isAnimating = false;
      this.animateIn = false;
    }, 150); 
  }
  // Fetch offer products from backend




  getOfferProducts() {
    this.http.get<any>('https://artshop-backend-demo.fly.dev/items/featured').subscribe({
      next: (res) => {
        console.log('Offer Products:', res);
        this.products = res.items;
      },
      error: (err) => {
        console.error('Error fetching offer products:', err);
      }
    });
  }






  ngOnInit() {
    this.getOfferProducts();
    this.fetchProfile();
    this.cartService.updateUnifiedCartCount();


  }







  openSideMenu() {
    this.sideMenuOpen = true;
  }

  closeSideMenu() {
    this.sideMenuOpen = false;
  }


  constructor(private http: HttpClient, private router: Router, private cartService: CartService) { }


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

        const newCartToken = res?.cart_token;
        if (newCartToken) {
          localStorage.setItem('cart_token', newCartToken);
        }

        console.log("token ", res.cart_token)
        console.log('Full Profile Response:', res);
        console.log('Profile:', this.profileArray);

        this.profileName = res.customer?.name;
        this.profileEmail = res.customer?.email;
        this.profilePhone = res.customer?.phone; // no info for now

      },
      error: (err) => {

        this.showAnimatedAlert('პროფილის მიღება ვერ მოხერხდა ❌', 'error');
      }
    });
  }





  logout() {
    this.http.post<any>(
      'https://artshop-backend-demo.fly.dev/auth/logout',
      {},

      { withCredentials: true } // cookie must be sent
    ).subscribe({
      next: () => {
        this.showAnimatedAlert('გამოსვლა წარმატებით შესრულდა ✅', 'success');



        this.router.navigate(['/auth']);
      },
      error: (err) => {
        console.error('Logout error:', err);
        this.showAnimatedAlert('გამოსვლა ვერ მოხერხდა ❌', 'error');
      }
    });


  }

}
