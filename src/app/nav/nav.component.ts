import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
import { ServiceService } from '../service.service';
import { CartService } from '../cart.service';
import { Router, NavigationStart, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { RefreshService } from '../refresh.service';

declare var google: any

@Component({
  selector: 'app-nav',
  standalone: false,
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements AfterViewInit, OnInit, OnDestroy {


 copied = false;

// Add this method to your component
copyPhone() {
  const phone = '555-976-925';
  navigator.clipboard.writeText(phone);
  
  this.copied = true;
  setTimeout(() => {
    this.copied = false;
  }, 2000);
}

  noResults: boolean = false;
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



  constructor(private service: ServiceService, private cartService: CartService, private router: Router, private http: HttpClient, private refreshService: RefreshService, private cd: ChangeDetectorRef) {

  }

  refreshCart() {
    this.refreshService.refreshAccessToken();
  }





  searchTerm: string = '';
  WholeProducts: any[] = [];
  products: any[] = [];

  isProductsTabOpen: boolean = false; // controls popup visibility

  private routerEventsSub?: Subscription;

  ngOnInit() {
    // load all products for comprehensive search
    this.service.getWholeProcucts().subscribe({
      next: (resp: any) => {
        this.WholeProducts = resp ?? [];
        this.products = [...this.WholeProducts];
      },
      error: (err) => {
        console.error('Failed to preload products for search', err);
        this.WholeProducts = [];
        this.products = [];
      }
    });

    // existing subscriptions


    this.service.updatelikeProductCount();

    this.service.updateCartProductCount();

    this.service.cartCount$.subscribe(count => {
      this.productsInCart = count;
    });



    this.service.likedProductsCount$.subscribe(count => {
      this.productsLiked = count;
    });

    // Close menus/search when the route changes (e.g., when clicking product links)
    // Also clear search input/results so search is effectively disabled until user opens it again
    this.routerEventsSub = this.router.events.subscribe((evt: RouterEvent) => {

      if (evt instanceof NavigationStart || evt instanceof NavigationEnd) {

        this.menuOpen = false;
        this.searchActive = false;
        this.searchActive2 = false;
        this.searchActive3 = false;
        this.isProductsTabOpen = false;
        this.searchTerm = '';
        this.products = [];
        this.noResults = false;
        try { clearTimeout((<any>this)._searchTimer); } catch (e) { }
        // ensure template updates immediately
        try { this.cd.detectChanges(); } catch (e) { }
      }
    });
  }

  onSearch() {
    clearTimeout((<any>this)._searchTimer);
    (<any>this)._searchTimer = setTimeout(() => {
      const term = this.searchTerm.trim().toLowerCase();

      if (!term) {
        this.products = [];
        this.isProductsTabOpen = false;
        this.noResults = false;
        return;
      }

      // open popup
      this.isProductsTabOpen = true;

      // filter by common name/title fields
      this.products = this.WholeProducts.filter((p: any) => {
        const candidates: string[] = [
          p?.title,
          p?.name,
          p?.artist_name,
          p?.artist?.name,
          p?.customer?.name,
          p?.customer_name,
          p?.material,
          p?.style
        ]
          .filter(Boolean)
          .map(val => typeof val === 'string' ? val : String(val))
          .filter(val => val && val !== 'undefined' && val !== 'null');

        return candidates.some(field => field.toLowerCase().includes(term));
      });

      this.noResults = this.products.length === 0;
    }, 300);
  }



  closeSearchPopup() {
    this.isProductsTabOpen = false;
    this.noResults = false;
    this.products = [];
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
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');

    const savedToken = token; // Adjust based on actual response structure
    const headers = savedToken ? new HttpHeaders({ 'Authorization': `Bearer ${savedToken}` }) : undefined;
    const options: any = headers ? { headers } : { withCredentials: true };




    this.http.get(`https://plangton-production.up.railway.app/api/User/${userId}`, options).subscribe({ // for time auth check
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



  ngOnDestroy(): void {
    if (this.routerEventsSub) {
      this.routerEventsSub.unsubscribe();
    }
  }

}
