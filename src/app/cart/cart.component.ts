import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ServiceService } from '../service.service';
import { CartService } from '../cart.service';
import { GetProductInfoService } from '../get-product-info.service';

@Component({
  selector: 'app-cart',
  standalone: false,
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  loading = false;
  cartIsEmpty = true;
  ifIsFull = false;

  animatedTotalPrice: number = 0;
  private animationFrame: any;

  constructor(private getProductInfoService: GetProductInfoService, private http: HttpClient, private service: ServiceService, private cartService: CartService,) {
    cartService.getBackEndCarts = this.getBackendCart();
  }




  
  ngOnInit() {

    this.cartService.updateUnifiedCartCount();
    this.getBackendCart();



  }

  // Helper to get headers with cart token
  private getCartHeaders(): HttpHeaders {
    const cartToken = localStorage.getItem('cart_token');
    let headers = new HttpHeaders();
    if (cartToken) {
      headers = headers.set('X-Cart-Token', cartToken);
    }
    return headers;
  }

  // Get cart and items from backend

  // Add item to backend cart
  addToBackendCart(productId: string, quantity: number = 1) {
    const headers = this.getCartHeaders();
    const payload = { product_id: productId, quantity };

    this.http.post<any>(
      'https://artshop-backend-demo.fly.dev/cart/items',
      payload,
      { headers, withCredentials: true }
    ).subscribe({
      next: (res) => {
        console.log('Cart response:', res);

        this.cartItems = res.items || [];
        this.cartIsEmpty = this.cartItems.length === 0;
        this.ifIsFull = !this.cartIsEmpty;
        this.updateLikedStates();
        this.animateTotalPrice(this.getTotalPrice());
        this.service.updateCartCount();
        this.service.ProductsInCart = this.cartItems.length;
      },
      error: (err) => {
        console.error('Add to cart error:', err);
      }
    });
  }






  getBackendCart() {
    this.loading = true;

    const cartToken = localStorage.getItem('cart_token') || localStorage.getItem('guest_token');
    const headers = cartToken ? new HttpHeaders({ 'X-Cart-Token': cartToken }) : new HttpHeaders();


    this.http.get<any>('https://artshop-backend-demo.fly.dev/cart', { headers, withCredentials: true }).subscribe({
      next: (res) => {
        console.log('Fetched cart:', res);

        if (res.cart_token) {
          localStorage.setItem('cart_token', res.cart_token);
        }

        // Update cart items
        this.cartItems = res.items || [];
        this.cartIsEmpty = this.cartItems.length === 0;
        this.ifIsFull = !this.cartIsEmpty;

        // Update liked states
        this.updateLikedStates();

        // Animate total price
        const total = this.getTotalPrice();
        this.animateTotalPrice(total);

        // Update global cart count
        this.service.updateCartCount();
        this.service.ProductsInCart = this.cartItems.length;

        this.loading = false;
      },
      error: (err) => {
        console.error('Fetch cart error:', err);
        this.cartItems = [];
        this.cartIsEmpty = true;
        this.ifIsFull = false;

        // Ensure cart count is reset
        this.service.updateCartCount();
        this.service.ProductsInCart = 0;

        this.loading = false;

      }

    });



  }




  // Remove item from backend cart
  removeFromBackendCart(cart_item_id: any) {
    console.log('Removing item from cart:', cart_item_id);

    const cartToken = localStorage.getItem('cart_token') || localStorage.getItem('guest_token');
    const headers = cartToken ? new HttpHeaders({ 'X-Cart-Token': cartToken }) : new HttpHeaders();

    this.http.delete<any>(`https://artshop-backend-demo.fly.dev/cart/items/${cart_item_id}`, { headers, withCredentials: true }).subscribe({
      next: (res) => {
        // Refresh cart items after deletion
        this.getBackendCart();
        this.cartService.updateUnifiedCartCount();

      },
      error: (err) => {
        console.error('Remove from cart error:', err);
      }

    });




  }
  // Clear the backend cart (if supported)
  clearBackendCart() {
    for (const item of this.cartItems) {
      this.removeFromBackendCart(item.id);
    }
  }

  // Total price calculation
  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => sum + (Number(item.line_total) || 0), 0);
  }


  animateTotalPrice(newPrice: number) {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    const duration = 400; // ms
    const start = this.animatedTotalPrice;
    const change = newPrice - start;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        this.animatedTotalPrice = Math.round(start + change * (1 - Math.pow(1 - progress, 3)));
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.animatedTotalPrice = newPrice;
      }
    };

    requestAnimationFrame(animate);
  }

  // Liked products logic
  addToLikedProducts(productId: string) {
    const likedProducts = JSON.parse(localStorage.getItem('LikedProducts') || '[]');
    const index = likedProducts.findIndex((item: any) => item.id === productId);

    if (index > -1) {
      likedProducts.splice(index, 1);
    } else {
      likedProducts.push({ id: productId });
    }

    localStorage.setItem('LikedProducts', JSON.stringify(likedProducts));

    // Update the product's isLiked in cartItems
    this.cartItems.forEach(item => {
      item.isLiked = likedProducts.some((p: any) => p.id === item.id);
    });

    this.service.updatelikeProductCount();
  }

  updateLikedStates() {
    const likedProducts = JSON.parse(localStorage.getItem('LikedProducts') || '[]');
    this.cartItems.forEach(item => {
      item.isLiked = likedProducts.some((p: any) => p.id === item.id);
    });
  }

  


 createOrder() {

  
   
 this.getProductInfoService.CartToken = localStorage.getItem('cart_token')
  console.log('Cart token set:', this.getProductInfoService.CartToken);




  // const cartToken = localStorage.getItem('cart_token') || localStorage.getItem('guest_token');
  // const guestToken = localStorage.getItem('guest_token');
  // let headers = new HttpHeaders();

  // if (cartToken) {
  //   headers = headers.set('X-Cart-Token', cartToken);
  // }
  // if (guestToken) {
  //   headers = headers.set('X-Guest-Token', guestToken);
  // }

  // this.http.post<any>(
  //   'https://artshop-backend-demo.fly.dev/checkout/create',
  //   {},
  //   { headers, withCredentials: true }
  // ).subscribe({
  //   next: (res) => {
  //     console.log('Order created:', res);
  //     if (res.order?.payment_url) {
  //       window.location.href = res.order.payment_url;
  //     } else {
  //       alert('Order created! Order ID: ' + res.order?.order_id);
  //     }
  //   },
  //   error: (err) => {
  //     if (err.status === 404 && err.error?.error === 'cart_not_found') {
  //       alert('Cart not found. Please add items to your cart before checkout.');
  //     } else if (err.status === 400) {
  //       alert('Missing cart or empty cart');
  //     } else if (err.status === 401) {
  //       alert('Guest verification required or invalid token');
  //     } else {
  //       alert('Order creation failed');
  //     }
  //     console.error('Order error:', err);
  //   }
  // });
}



}