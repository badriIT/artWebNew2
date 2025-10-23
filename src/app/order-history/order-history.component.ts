import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-order-history',
  standalone: false,
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent {


  profileName = '';
  profileEmail = '';
  profilePhone = '';



  profile: any = null;
  profileArray: { key: string, value: any }[] = [];


  sideMenuOpen = false;





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













  openSideMenu() {
    this.sideMenuOpen = true;
  }

  closeSideMenu() {
    this.sideMenuOpen = false;
  }


  constructor(private http: HttpClient, private router: Router, private cartService: CartService) { }


  fetchProfile() {
    // show skeleton
 

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
          { key: 'აქტიურია', value: res.customer?.is_active ? 'დიახ' : 'კი' },
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
        this.profilePhone = res.customer?.phone;
      },
      error: (err) => {
    
        this.showAnimatedAlert('პროფილის მიღება ვერ მოხერხდა ❌', 'error');
        console.error('Profile fetch error', err);
      }
    });
  }


  ngOnInit() {
    this.fetchProfile();
    this.cartService.updateUnifiedCartCount();


  }

  getOrders() {
    
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
