import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();

  getBackEndCarts: any;

  constructor(private http: HttpClient) { }

  // კალათაში დამატება
  addToCart(product_id: string, quantity: number = 1): Observable<any> {
    const cartToken = localStorage.getItem('cart_token');
    const headers = cartToken
      ? new HttpHeaders({
          'Content-Type': 'application/json',
          'X-Cart-Token': cartToken
        })
      : new HttpHeaders({ 'Content-Type': 'application/json' });

    const payload = { product_id, quantity };
    console.log('🛒 Sending to cart API:', payload, headers);

    return this.http.post<any>('https://artshop-backend-demo.fly.dev/cart/items', payload, { headers });
  }

  // კალათის რაოდენობის განახლება
  updateCartCount() {
    const cartToken = localStorage.getItem('cart_token');
    const headers = cartToken
      ? new HttpHeaders({ 'X-Cart-Token': cartToken })
      : new HttpHeaders();

    this.http.get<any>('https://artshop-backend-demo.fly.dev/cart', { headers }).subscribe({
      next: (res) => this.cartCount.next(res.items?.length || 0),
      error: () => this.cartCount.next(0)
    });
  }
}