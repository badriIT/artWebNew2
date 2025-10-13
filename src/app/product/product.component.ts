import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from '../service.service';
import { RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { forkJoin } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CartComponent } from '../cart/cart.component';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-product',
  standalone: true,              // <-- Make it standalone
  imports: [CommonModule, RouterModule],  // <-- Add these imports
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  transform = 'scale(1)';
  transformOrigin = 'center center';


  cartItems: any[] = [];


  likedProductIds: string[] = [];
  isLiked: boolean = false;



  title!: string;
  artist!: string;
  price!: string;
  matherial!: string;
  style!: string;
  year!: string;
  img!: string;
  productId!: string;
  artistData: any;
  otherWorks: any[] = [];

  products: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ServiceService,
    private location: Location,
    private http: HttpClient, // <-- Add this
    private cart: CartService,
    private cartService: CartService
  ) { }

  loadProduct(id: string) {
    this.service.getProductById(id).subscribe(product => {
      if (!product) return;

      this.title = product.title;
      this.artist = product.artist_name;
      this.price = product.price;
      this.matherial = product.material;
      this.style = product.style;
      this.year = product.year_created;
      this.img = product.image;

      // Load artist's other works
      this.loadArtistData(product.artist_name);
    });
  }

  loadArtistData(name: string) {
    this.service.getArtists().subscribe((data: any) => {
      this.artistData = data.artists.find((a: any) =>
        a.artist_name.toLowerCase().trim() === name.toLowerCase().trim()
      );

      console.log("artist data", this.artistData);
      this.service.EachArtistsInfo = this.artistData;

      if (this.artistData) {
        this.otherWorks = this.artistData.featured_items.filter(
          (item: any) => item.id !== this.productId
        );
      }
    });
  }

  changeProduct(art: any) {
    this.router.navigate(['/product', art.id]);
  }

  onMouseMove(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    this.transform = 'scale(2.5)';
    this.transformOrigin = `${x}% ${y}%`;
  }

  onMouseLeave() {
    this.transform = 'scale(1)';
    this.transformOrigin = 'center center';
  }

  ngOnInit() {
    this.cartService.updateUnifiedCartCount();
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id')!;
      if (this.productId) {
        this.loadProduct(this.productId);
        this.loadLikedProducts(); // <-- Load liked IDs on init
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  loadLikedProducts() {
    const likedProducts = JSON.parse(localStorage.getItem('LikedProducts') || '[]');
    this.likedProductIds = likedProducts.map((item: any) => String(item.id));
    this.isLiked = this.likedProductIds.includes(String(this.productId));
  }


  goBack() {
    this.location.back(); // navigates to the previous page in history
  }


  addToCart(item_id: string, quantity: number = 1) {
    // თუ ჯერ არ გვაქვს cart_token
    let cartToken = localStorage.getItem('cart_token') || localStorage.getItem('guest_token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      ...(cartToken ? { 'X-Cart-Token': cartToken } : {})

    });

    this.router.navigate(['/cart']);

    const payload = { item_id, quantity };

    this.http.post<any>('https://artshop-backend-demo.fly.dev/cart/items', payload, { headers, withCredentials: true })
      .subscribe({
        next: (res) => {
          console.log('Cart response:', res);
          this.cartItems = res.items || [];
          this.service.ProductsInCart = this.cartItems.length;

          // თუ backend აძლევს ახალ cart_token-ს, დავიმახსოვროთ
          if (res.cart_token) localStorage.setItem('cart_token', res.cart_token);

          // cart count update
          this.cart.updateUnifiedCartCount();
        },
        error: (err) => {
          console.error('Add to cart error:', err);
          alert(`პროდუქტის დამატება ვერ მოხერხდა: ${err.error?.error || 'unknown error'}`);
        }
      });
  }








  addToLikedProducts() {

    const likedProducts = JSON.parse(localStorage.getItem('LikedProducts') || '[]');
    const existingProductIndex = likedProducts.findIndex((item: any) => item.id === this.productId);

    if (existingProductIndex > -1) {
      // Product is already liked → remove it
      likedProducts.splice(existingProductIndex, 1);
      this.isLiked = false;
    } else {
      // Product not liked → add it
      const newProduct = {
        id: this.productId,
      };


      likedProducts.push(newProduct);
      this.isLiked = true;
    }

    localStorage.setItem('LikedProducts', JSON.stringify(likedProducts));

    this.service.updatelikeProductCount()
  }


 BuyInOneClick() {
  const payload = { item_id: this.productId };

  this.http.post<any>(
    'https://artshop-backend-demo.fly.dev/checkout/quick',
    payload,
    { withCredentials: true }
  ).subscribe({
    next: (res) => {
      console.log('Quick buy response:', res);
      if (res.order?.payment_url) {
         console.log('Redirecting to payment URL:', res.order.payment_url);
         window.location.href = res.order.payment_url; // Redirect to payment

      } else {
        alert('Order created! Order ID: ' + res.order?.order_id);
      }
    },
    error: (err) => {
      console.error('Quick buy error:', err);
      alert(`შეკვეთის განხორციელება ვერ მოხერხდა: ${err.error?.error || 'unknown error'}`);
    }
  });
}





}


