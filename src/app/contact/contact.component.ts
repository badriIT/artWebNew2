import { Component } from '@angular/core';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  constructor(private cartService: CartService) { }

  ngOnInit() {
    this.cartService.updateCartCount();
  }

}
