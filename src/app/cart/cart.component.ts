import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ServiceService } from '../service.service';
import { CartService } from '../cart.service';
import { GetProductInfoService } from '../get-product-info.service';
import { Router } from '@angular/router';
 import { firstValueFrom } from 'rxjs';





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



  formatPrice(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';
    const s = String(value);
    const [intPart, decPart] = s.split('.');
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decPart ? `${withCommas}.${decPart}` : withCommas;
  }


  constructor(private router: Router, private getProductInfoService: GetProductInfoService, private http: HttpClient, private service: ServiceService, private cartService: CartService,) {



    // cartService.getBackEndCarts = this.getBackendCart.bind(this);
  }

  productsInCart: number = 0;


 



  ngOnInit() {


    this.LoadItems();






    // this.cartService.updateUnifiedCartCount();
    // this.getBackendCart();








    console.log("Cart component initialized.");


    if (this.productsInCart > 0) {

      this.cartIsEmpty = false;
    }

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









  // getBackendCart() {
  //   this.loading = true;
  //   // console.log(this.loading);

  //   const cartToken = localStorage.getItem('cart_token') || localStorage.getItem('guest_token');
  //   const headers = cartToken ? new HttpHeaders({ 'X-Cart-Token': cartToken }) : new HttpHeaders();

  //   setTimeout(() => {


  //     this.http.get<any>('https://artshop-backend-demo.fly.dev/cart', { headers, withCredentials: true }).subscribe({
  //       next: (res) => {
  //         console.log('Fetched cart:', res);

  //         if (res.cart_token) {
  //           localStorage.setItem('cart_token', res.cart_token);
  //         }

  //         // Update cart items
  //         this.cartItems = res.items || [];
  //         this.cartIsEmpty = this.cartItems.length === 0;
  //         this.ifIsFull = !this.cartIsEmpty;

  //         // Update liked states
  //         this.updateLikedStates();

  //         // Animate total price
  //         const total = this.getTotalPrice();
  //         this.animateTotalPrice(total);

  //         // Update global cart count

  //         this.service.ProductsInCart = this.cartItems.length;

  //         this.loading = false;
  //       },
  //       error: (err) => {
  //         console.error('Fetch cart error:', err);
  //         this.cartItems = [];
  //         this.cartIsEmpty = true;
  //         this.ifIsFull = false;

  //         // Ensure cart count is reset
  //         this.service.ProductsInCart = 0;

  //         this.loading = false;

  //       }

  //     });

  //   }, 200);

  // }



  // getBackendCartHelper() {

  //   // console.log(this.loading);

  //   const cartToken = localStorage.getItem('cart_token') || localStorage.getItem('guest_token');
  //   const headers = cartToken ? new HttpHeaders({ 'X-Cart-Token': cartToken }) : new HttpHeaders();

  //   setTimeout(() => {


  //     this.http.get<any>('https://artshop-backend-demo.fly.dev/cart', { headers, withCredentials: true }).subscribe({
  //       next: (res) => {
  //         console.log('Fetched cart:', res);

  //         if (res.cart_token) {
  //           localStorage.setItem('cart_token', res.cart_token);
  //         }

  //         // Update cart items
  //         this.cartItems = res.items || [];
  //         this.cartIsEmpty = this.cartItems.length === 0;
  //         this.ifIsFull = !this.cartIsEmpty;

  //         // Update liked states
  //         this.updateLikedStates();

  //         // Animate total price
  //         const total = this.getTotalPrice();
  //         this.animateTotalPrice(total);

  //         // Update global cart count

  //         this.service.ProductsInCart = this.cartItems.length;


  //       },
  //       error: (err) => {
  //         console.error('Fetch cart error:', err);
  //         this.cartItems = [];
  //         this.cartIsEmpty = true;
  //         this.ifIsFull = false;

  //         // Ensure cart count is reset
  //         this.service.ProductsInCart = 0;



  //       }

  //     });

  //   }, 200);

  // }



  // Remove item from backend cart
  // removeFromBackendCart(cart_item_id: any) {
  //   console.log('Removing item from cart:', cart_item_id);

  //   const cartToken = localStorage.getItem('cart_token') || localStorage.getItem('guest_token');
  //   const headers = cartToken ? new HttpHeaders({ 'X-Cart-Token': cartToken }) : new HttpHeaders();



  //   this.http.delete<any>(`https://artshop-backend-demo.fly.dev/cart/items/${cart_item_id}`, { headers, withCredentials: true }).subscribe({
  //     next: (res) => {
  //       // Refresh cart items after deletion
  //       this.getBackendCartHelper();
  //       this.cartService.updateUnifiedCartCount();

  //     },
  //     error: (err) => {
  //       console.error('Remove from cart error:', err);
  //     }

  //   });




  // }
  // Clear the backend cart (if supported)
  // clearBackendCart() {
  //   for (const item of this.cartItems) {
  //     this.removeFromBackendCart(item.id);
  //   }
  // }

  // Total price calculation
  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => {
      const unit = Number(item.unit_price) || Number(item.price) || 0;
      const qty = Number(item.quantity) || 1;
      return sum + unit * qty;
    }, 0);
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
  addToLikedProducts(productId: any) {
    const idStr = String(productId);
    const likedProducts = JSON.parse(localStorage.getItem('LikedProducts') || '[]');

    const index = likedProducts.findIndex((item: any) => String(item.id) === idStr);

    if (index > -1) {
      likedProducts.splice(index, 1);
    } else {
      likedProducts.push({ id: idStr });
    }

    localStorage.setItem('LikedProducts', JSON.stringify(likedProducts));

    // Update the product's isLiked in cartItems using string comparison
    this.cartItems.forEach(item => {
      item.isLiked = likedProducts.some((p: any) => String(p.id) === String(item.id));
    });

    this.service.updatelikeProductCount();
  }

  updateLikedStates() {
    const likedProducts = JSON.parse(localStorage.getItem('LikedProducts') || '[]');
    this.cartItems.forEach(item => {
      item.isLiked = likedProducts.some((p: any) => String(p.id) === String(item.id));
    });
  }




  // createOrder() {


  //   this.getProductInfoService.CartToken = localStorage.getItem('cart_token')
  //   console.log('Cart token set:', this.getProductInfoService.CartToken);






  // }




  async LoadItems() {
    this.loading = true;
    const cart = JSON.parse(localStorage.getItem('CartProducts') || '[]');
    this.cartItems = [];

    for (const item of cart) {
      try {
        const product: any = await firstValueFrom(this.http.get<any>(`https://plangton-production.up.railway.app/api/ArtWork/${item.id}`));

        // Normalize fields expected by the template
        const unitPrice = Number(product.unit_price ?? product.price ?? product.price_amount ?? 0);
        const qty = Number(item.quantity ?? 1);

        const cartEntry = {
          ...product,
          unit_price: unitPrice,
          quantity: qty,
          // keep a local cart_item_id so delete UI can reference it
          cart_item_id: item.cart_item_id ?? item.id ?? product.id,
        };

        this.cartItems.push(cartEntry);
      } catch (e) {
        console.warn('Failed to load product for cart id', item.id, e);
      }
    }

    // Update flags and totals
    this.cartIsEmpty = this.cartItems.length === 0;
    this.ifIsFull = !this.cartIsEmpty;
    this.service.ProductsInCart = this.cartItems.length;
    this.service.updateCartProductCount();

    // Ensure liked state is set for each loaded item
    this.updateLikedStates();

    const total = this.getTotalPrice();
    this.animateTotalPrice(total);
    this.loading = false;
  }


  removeFromLCart(id: any) {

    const cartItems = JSON.parse(localStorage.getItem('CartProducts') || '[]')
      .filter((cartItem: any) => String(cartItem.id) !== String(id));

    localStorage.setItem('CartProducts', JSON.stringify(cartItems));

    // reload and update counts
    this.LoadItems();
    this.service.updateCartProductCount();

  }


}