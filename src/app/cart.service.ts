import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartCount = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCount.asObservable();
























  constructor(private http: HttpClient) { }

  // Guest token-ს ვიღებთ ან ვქმნით
  private getGuestToken(): string {
    let token = localStorage.getItem('guest_token');
    if (!token) {
      token = 'guest_' + Math.random().toString(36).substr(2, 10);
      localStorage.setItem('guest_token', token);
    }
    return token;
  }

  // კალათაში დამატება
  addToCart(item_id: string, quantity: number = 1): Observable<any> {
    const cartToken = localStorage.getItem('cart_token') || this.getGuestToken();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Cart-Token': cartToken
    });

    const payload = { item_id, quantity };
    console.log('🛒 Sending to cart API:', payload, headers);

    return this.http.post<any>('https://artshop-backend-demo.fly.dev/cart/items', payload, { headers });

  }

  // კალათის რაოდენობის განახლება
  updateCartCount() {
    const cartToken = localStorage.getItem('cart_token') || this.getGuestToken();
    const headers = new HttpHeaders({ 'X-Cart-Token': cartToken });

    this.http.get<any>('https://artshop-backend-demo.fly.dev/cart', { headers }).subscribe({
      next: (res) => this.cartCount.next(res.items?.length || 0),
      error: () => this.cartCount.next(0)
    });

    // console.log("Cart count updated 2:", this.cartCount.value);
  }
}
