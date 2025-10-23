import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';1
import { forkJoin, Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ServiceService {

  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  private likedProductsSubject = new BehaviorSubject<number>(0);
  likedProductsCount$ = this.likedProductsSubject.asObservable();

  updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartCountSubject.next(cart.length);
  }

  updatelikeProductCount() {
    const liked = JSON.parse(localStorage.getItem('LikedProducts') || '[]');
    this.likedProductsSubject.next(liked.length);
  }



  





  ProductsInCart!: number;





  EachArtistsInfo: any










  maxPrice?: number;
  minPrice?: number;

  // Add filter properties here (to be set from component)
  selectedSizesLabels: string[] = [];
  selectedColorsNames: string[] = [];
  selectedMaterials: string[] = [];
  selectedStyles: string[] = [];
  selectedThemes: string[] = [];
  selectedFormats: string[] = [];
  selectedTypes: string[] = [];

  widthMaxValues!: any
  widthMinValues!: any
  heightMaxValues!: any
  heightMinValues!: any

  constructor(private http: HttpClient) {
    this.updateCartCount()


  }

   


  getArtists() {
    return this.http.get('https://artshop-backend-demo.fly.dev/artists?page=1&limit=12');
  }
    

  getWholeProcucts(): Observable<any> {
    return this.http.get<any>(`https://artshop-backend-demo.fly.dev/items?`);
  }


  getProducts(page: number = 1, limit: number = 12): Observable<any> {
    let params: string[] = [];

    if (this.minPrice !== undefined) {
      params.push(`min_price=${this.minPrice}`);
    }
    if (this.maxPrice !== undefined) {
      params.push(`max_price=${this.maxPrice}`);
    }

    // Sizes filter (send as comma separated)
    if (this.widthMinValues) {
      // encodeURIComponent to avoid issues with special characters
      params.push(`min_width_cm=${encodeURIComponent(this.widthMinValues.join(','))}`);
    }

    if (this.widthMaxValues) {
      // encodeURIComponent to avoid issues with special characters
      params.push(`max_width_cm=${encodeURIComponent(this.widthMaxValues.join(','))}`);
    }

    if (this.heightMaxValues) {
      // encodeURIComponent to avoid issues with special characters
      params.push(`max_height_cm=${encodeURIComponent(this.heightMaxValues.join(','))}`);
    }

    if (this.heightMaxValues) {
      // encodeURIComponent to avoid issues with special characters
      params.push(`min_height_cm=${encodeURIComponent(this.heightMinValues.join(','))}`);
    }

    // Colors filter (comma separated color names)
    if (this.selectedColorsNames.length > 0) {
      params.push(`color=${encodeURIComponent(this.selectedColorsNames.join(','))}`);
    }

    // Materials filter
    if (this.selectedMaterials.length > 0) {
      params.push(`material=${encodeURIComponent(this.selectedMaterials.join(','))}`);
    }

    // Styles filter
    if (this.selectedStyles.length > 0) {
      params.push(`style=${encodeURIComponent(this.selectedStyles.join(','))}`);
    }

    // Themes filter
    if (this.selectedThemes.length > 0) {
      params.push(`theme=${encodeURIComponent(this.selectedThemes.join(','))}`);
    }

    // Formats filter
    if (this.selectedFormats.length > 0) {
      params.push(`shape=${encodeURIComponent(this.selectedFormats.join(','))}`);
    }

    // Types filter
    if (this.selectedTypes.length > 0) {
      params.push(`type=${encodeURIComponent(this.selectedTypes.join(','))}`);
    }

    // Pagination params
    params.push(`page=${page}`);
    params.push(`limit=${limit}`);

    const url = `https://artshop-backend-demo.fly.dev/items?` + params.join('&');

    return this.http.get<any>(url);
  }



  getProductById(id: string): Observable<any> {
    return this.http.get<any>(`https://artshop-backend-demo.fly.dev/items/${id}`);
  }

  getArtistById(id: string): Observable<any> {
    return this.http.get<any>(`https://artshop-backend-demo.fly.dev/artists/${id}`);
  }


  getAllArtists(initial: string = '', page: number = 1, limit: number = 12): Observable<any> {
    const initialParam = initial ? `initial=${initial}&` : '';
    const url = `https://artshop-backend-demo.fly.dev/artists?${initialParam}page=${page}&limit=${limit}`;
    return this.http.get<any>(url);
  }









}

