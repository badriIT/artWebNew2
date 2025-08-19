import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { flush } from '@angular/core/testing';
import { ServiceService } from '../service.service';

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
  ifIsFull = false


  likedProductIds: string[] = [];
  isLiked: boolean = false;


  animatedTotalPrice: number = 0;
  private animationFrame: any;

  constructor(private http: HttpClient, private service: ServiceService) { }

  ngOnInit() {
    this.loadCartItems();




    this.cartItems.filter((price) => price.price)
    console.log("filtered", this.cartItems)


  }


  getTotalPrice(): number {
    return this.cartItems.reduce((sum, item) => {
      return sum + (Number(item.price) * (item.quantity || 1));
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
        // Ease out cubic
        this.animatedTotalPrice = Math.round(start + change * (1 - Math.pow(1 - progress, 3)));
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.animatedTotalPrice = newPrice;
      }
    };

    requestAnimationFrame(animate);
  }


  async loadCartItems() {
  this.loading = true;

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  this.cartItems = [];

  // Fetch each product detail from backend
  for (const item of cart) {
    try {
      const product: any = await this.http.get(`https://artshop-backend-demo.fly.dev/items/${item.id}`).toPromise();
      // Add quantity and temporary isLiked
      this.cartItems.push({ ...product, quantity: item.quantity || 1, isLiked: false });
    } catch (e) {
      console.error('Product fetch error', e);
    }
  }

  // After loading all products, update liked states
  this.updateLikedStates();

  // Animate total price
  const total = this.getTotalPrice();
  this.animateTotalPrice(total);

  // Update cart flags
  this.cartIsEmpty = this.cartItems.length === 0;
  this.ifIsFull = !this.cartIsEmpty;

  this.loading = false;

  this.service.updateCartCount();
  this.service.ProductsInCart = this.cartItems.length;
}


  removeFromCart(item: any) {



    this.service.updateCartCount()


    console.log(item)



    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      .filter((cartItem: any) => String(cartItem.id) !== item);

    localStorage.setItem('cart', JSON.stringify(cart));

    this.loadCartItems(); // Reloads cartItems and updates flags





  }
  clearCart() {
    this.cartItems = [];
    localStorage.removeItem('cart');
  }











 addToLikedProducts(productId: string) {
  const likedProducts = JSON.parse(localStorage.getItem('LikedProducts') || '[]');
  const index = likedProducts.findIndex((item: any) => item.id === productId);

  if (index > -1) {
    // Already liked → remove
    likedProducts.splice(index, 1);
  } else {
    // Not liked → add
    likedProducts.push({ id: productId });
  }

  localStorage.setItem('LikedProducts', JSON.stringify(likedProducts));

  // Update the product's isLiked in cartItems
  this.cartItems.forEach(item => {
    item.isLiked = likedProducts.some((p: any) => p.id === item.id);
  });

  this.service.updatelikeProductCount();
}


  // Call this after loading cart items
 updateLikedStates() {
  const likedProducts = JSON.parse(localStorage.getItem('LikedProducts') || '[]');
  this.cartItems.forEach(item => {
    item.isLiked = likedProducts.some((p: any) => p.id === item.id);
  });
}




}