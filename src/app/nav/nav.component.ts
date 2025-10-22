import { AfterViewInit, Component } from '@angular/core';
import { ServiceService } from '../service.service';
import { CartService } from '../cart.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { RefreshService } from '../refresh.service';

declare var google: any

@Component({
  selector: 'app-nav',
  standalone: false,
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements AfterViewInit {


  selectedLanguage: string = 'ka';

  changeLanguageToGeorgian() {
 
    localStorage.setItem('preferredLanguage', 'ka');
  }

  changeLanguageToEnglish() {


    localStorage.setItem('preferredLanguage', 'en');
  }



  ngAfterViewInit(): void {
    this.loadGoogleTranslate();
  }

  loadGoogleTranslate() {
    if (!(<any>window).google || !(<any>window).google.translate) {
      const script = document.createElement('script');
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);

      (<any>window).googleTranslateElementInit = () => {
        new google.translate.TranslateElement(
          { pageLanguage: 'auto', layout: google.translate.TranslateElement.InlineLayout.SIMPLE },
          'google_translate_element'
        );
      };
    }
  }

  translateToEnglish() {
    const iframe: HTMLIFrameElement | null = document.querySelector('iframe.goog-te-menu-frame');
    if (iframe) {
      const innerDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (innerDoc) {
        const langButton = innerDoc.querySelector<HTMLAnchorElement>('a[href*="en"]');
        if (langButton) langButton.click();
      }
    } else {
      // fallback: change cookie and reload
      this.setGoogleTranslateLang('en');
    }
  }

  translateToGeorgian() {
    // Reset Google Translate to original language
    document.cookie = 'googtrans=/auto/auto;path=/;domain=' + location.hostname;
    window.location.reload();

 
  }


  private setGoogleTranslateLang(lang: string) {
    const cookieName = 'googtrans';
    document.cookie = `${cookieName}=/auto/${lang};path=/`;
    window.location.reload();
  }







  productsInCart: number = 0;
  productsLiked: number = 0;



  constructor(private service: ServiceService, private cartService: CartService, private router: Router, private http: HttpClient, private refreshService: RefreshService) {
   
  }

  refreshCart() {
    this.refreshService.refreshAccessToken();
  }





  searchTerm: string = '';
  WholeProducts: any[] = [];
  products: any[] = [];

  isProductsTabOpen: boolean = false; // controls popup visibility

  ngOnInit() {

    
    this.cartService.cartCount$.subscribe(count => {
      this.productsInCart = count;
      // Now productsInCart will always be correct!
    });





    this.cartService.getBackEndCarts
  


      this.service.updatelikeProductCount();

    this.cartService.cartCount$.subscribe(count => {
      this.productsInCart = count;
      console.log("Cart count updated:", count);
    });

    this.service.likedProductsCount$.subscribe(count => {
      this.productsLiked = count;
    });

  }

  onSearch() {




    setTimeout(() => {

      const term = this.searchTerm.trim().toLowerCase();

      if (term) {
        // Filter products
        this.products = this.WholeProducts.filter(p =>
          p.title.toLowerCase().includes(term)
        );

        // Show products popup
        this.isProductsTabOpen = true;
      } else {
        // Reset if search is empty
        this.products = [...this.WholeProducts];
        this.isProductsTabOpen = false;
      }

    }, 1200);

  }
























  searchActive: boolean = false;
  searchActive2: boolean = false;
  searchActive3: boolean = false;
  menuOpen = false;

  toogleSearch() {
    this.searchActive = !this.searchActive
  }

  toogleSearch2() {
    this.searchActive2 = !this.searchActive2
  }

  toogleSearch3() {
    this.searchActive3 = !this.searchActive3
  }


  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }


  goToPersonalOrAuth() {
    this.http.get('https://artshop-backend-demo.fly.dev/auth/profile', { withCredentials: true }).subscribe({
      next: (res) => {
        // If profile loads, navigate to personal
        this.router.navigate(['/personal']);
      },
      error: (err) => {
        // If error, navigate to auth/login
        this.router.navigate(['/auth']);
      }
    });
  }

}
