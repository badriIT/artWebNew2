import { Component } from '@angular/core';
import { ServiceService } from '../service.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-liked-products',
  standalone: false,
  templateUrl: './liked-products.component.html',
  styleUrl: './liked-products.component.css'
})
export class LikedProductsComponent {

  likedItems: any[] = [];
  loading = false;



  likedProductIds: string[] = [];
  isLiked: boolean = false;


  constructor(private service: ServiceService, private http: HttpClient) { }

  ngOnInit() {
    this.loadLikedItems()
  }

  async loadLikedItems() {


   
    this.service.updatelikeProductCount()



    this.loading = true;
    const cart = JSON.parse(localStorage.getItem('LikedProducts') || '[]');
    this.likedItems = [];

    // Fetch each product detail from backend
    for (const item of cart) {
      try {
        const product = await this.http.get(`https://artshop-backend-demo.fly.dev/items/${item.id}`).toPromise();
        // Merge quantity or other cart info if needed
        this.likedItems.push({ ...product, quantity: item.quantity || 1 });
      } catch (e) {
        // Optionally handle error (e.g., product not found)
      }
    }




    this.loading = false;


    console.log('likedProducts items', this.likedItems);




    console.log(this.likedItems.length)
    this.service.ProductsInCart = this.likedItems.length;
    console.log('Products in likedSection:', this.service.ProductsInCart);


  }


  removeFromLiked(id: any) {

    const likedProduct = JSON.parse(localStorage.getItem('LikedProducts') || '[]')
      .filter((cartItem: any) => String(cartItem.id) !== id);

    localStorage.setItem('LikedProducts', JSON.stringify(likedProduct));

    this.loadLikedItems(); 

    this.service.updatelikeProductCount()

  

  }

}
