import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-personal',
  standalone: false,
  templateUrl: './personal.component.html',
  styleUrl: './personal.component.css'
})
export class PersonalComponent {

  profileName = '';
  profileEmail = '';
  profilePhone = '';


  profile: any = null;
  profileArray: { key: string, value: any }[] = [];


  constructor(private http: HttpClient) { }


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

        this.profileName = res.customer?.name;
        this.profileEmail = res.customer?.email;
        this.profilePhone = res.customer?.phone; // no info for now
       
      },
      error: (err) => {
        alert('პროფილის მიღება ვერ მოხერხდა');
      }
    });
  }


  ngOnInit() {
    this.fetchProfile();

  }


  logout() {
    this.http.post<any>(
      '/auth/logout',
      {},
      { withCredentials: true } // cookie must be sent
    ).subscribe({
      next: () => {
        alert('გამოსვლა წარმატებით შესრულდა ✅'); // notification
      },
      error: (err) => {
        console.error('Logout error:', err);
        alert('გამოსვლა ვერ მოხერხდა ❌');
      }
    });
  }
}
