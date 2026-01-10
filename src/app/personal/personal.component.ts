import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-personal',
  standalone: false,
  templateUrl: './personal.component.html',
  styleUrl: './personal.component.css'
})
export class PersonalComponent {

  profilePersonalNumber = ''
  profileName = '';
  profileEmail = '';
  profilePhone = '';
  profileLastName = '';
  profileUserName = '';



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

    const savedToken = localStorage.getItem('token'); // Adjust based on actual response structure
    const headers = savedToken ? new HttpHeaders({ 'Authorization': `Bearer ${savedToken}` }) : undefined;
    const options: any = headers ? { headers } : { withCredentials: true };

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      console.error('No user_id found in localStorage');
      this.router.navigate(['/auth']);
      return;

    }


    // No need to send access token manually, just use withCredentials
    this.http.get<any>(
      `https://plangton-production.up.railway.app/api/User/${userId}`,
      options
    ).subscribe({
      next: (res: any) => {
        this.profile = res;
        console.log('Fetched profile:', this.profile);


        this.profilePersonalNumber = res.personalNumber
        this.profileName = res.firstName
        this.profileEmail = res.email
        this.profilePhone = res.mobileNumber
        this.profileLastName = res.lastName
        this.profileUserName = res.username

        // Flatten the profile and stats into an array






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



  logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('token');
    this.router.navigate(['/auth']);

  }

  // logout() {
  //   this.http.post<any>(
  //     'https://artshop-backend-demo.fly.dev/auth/logout',
  //     {},

  //     { withCredentials: true } // cookie must be sent
  //   ).subscribe({
  //     next: () => {
  //       this.showAnimatedAlert('გამოსვლა წარმატებით შესრულდა ✅', 'success');



  //       this.router.navigate(['/auth']);
  //     },
  //     error: (err) => {
  //       console.error('Logout error:', err);
  //       this.showAnimatedAlert('გამოსვლა ვერ მოხერხდა ❌', 'error');
  //     }
  //   });


  // }



  updateInfo() {
    const savedToken = localStorage.getItem('token');
    const headers = savedToken ? new HttpHeaders({ 'Authorization': `Bearer ${savedToken}` }) : undefined;
    const options: any = headers ? { headers } : { withCredentials: true };

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      console.error('No user_id found in localStorage');
      this.router.navigate(['/auth']);
      return;
    }

    const updatedProfile = {
      personalNumber: this.profilePersonalNumber,
      firstName: this.profileName,
      email: this.profileEmail,
      mobileNumber: this.profilePhone,
      lastName: this.profileLastName,
      username: this.profileUserName
    };

    this.http.put<any>(
      `https://plangton-production.up.railway.app/api/User`,
      updatedProfile,
      options
    ).subscribe({
      next: (res) => {
        console.log('Profile updated successfully:', res);
        this.showAnimatedAlert('პროფილი წარმატებით განახლდა ✅', 'success');
        // Optionally refresh the profile data
        this.fetchProfile();
      },
      error: (err) => {
        console.error('Update profile error:', err);
        this.showAnimatedAlert('პროფილის განახლება ვერ მოხერხდა ❌', 'error');
      }
    });
  }

}
