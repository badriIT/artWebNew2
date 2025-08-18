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

  constructor(private http: HttpClient, private service: ServiceService) { }

  ngOnInit() {
    this.loadCartItems();

    this.service.ProductsInCart = this.cartItems.length;


  }



  async loadCartItems() {







    this.loading = true;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartItems = [];

    // Fetch each product detail from backend
    for (const item of cart) {
      try {
        const product = await this.http.get(`https://artshop-backend-demo.fly.dev/items/${item.id}`).toPromise();
        // Merge quantity or other cart info if needed
        this.cartItems.push({ ...product, quantity: item.quantity || 1 });
      } catch (e) {
        // Optionally handle error (e.g., product not found)
      }
    }


    this.loading = false;


    console.log('cart items', this.cartItems);

    if (this.cartItems.length > 0) {
      this.cartIsEmpty = false;
      this.ifIsFull = true

    } else {
      this.cartIsEmpty = true;
      this.ifIsFull = false
    }


    console.log('empty', this.cartIsEmpty);
    console.log(this.cartItems.length)


  }

  removeFromCart(item: any) {





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
}