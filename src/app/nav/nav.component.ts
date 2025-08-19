import { AfterViewInit, Component } from '@angular/core';
import { ServiceService } from '../service.service';

declare var google: any

@Component({
  selector: 'app-nav',
  standalone: false,
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent implements AfterViewInit {

  
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



  constructor(private service: ServiceService,) {
    this.service.getWholeProcucts().subscribe(data => {
      this.WholeProducts = data.items


    })
  }


  



  searchTerm: string = '';
  WholeProducts: any[] = [];
  products: any[] = [];

  isProductsTabOpen: boolean = false; // controls popup visibility

  ngOnInit() {
    this.service.getWholeProcucts().subscribe(data => {
      this.WholeProducts = data.items;
      this.products = [...this.WholeProducts];
      this.productsInCart = this.service.ProductsInCart;
      this.service.updateCartCount()
      this.service.updatelikeProductCount()
    });

    this.service.cartCount$.subscribe(count => {
      this.productsInCart = count;
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
}
