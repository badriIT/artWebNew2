import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GetProductInfoService {

  constructor() { }

  productID: string = '';

  CartToken: string | null = null;


  productInfo() {
    console.log("Getting product info for ID:", this.productID);
  }

 
}
