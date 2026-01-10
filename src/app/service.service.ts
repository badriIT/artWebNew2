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


  updatelikeProductCount() {
    const liked = JSON.parse(localStorage.getItem('LikedProducts') || '[]');
    this.likedProductsSubject.next(liked.length);
  }

  updateCartProductCount() {
    const cart = JSON.parse(localStorage.getItem('CartProducts') || '[]');
    this.cartCountSubject.next(cart.length);
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
    


  }

   


  getArtists() {
    return this.http.get('https://artshop-backend-demo.fly.dev/artists?page=1&limit=12');
  }
    

  getWholeProcucts(): Observable<any> {
    return this.http.get<any>(`https://plangton-production.up.railway.app/api/ArtWork/GetAllProducts`);
  }

  getProductsTest(page: number = 1, limit: number = 12): Observable<any> {
    return this.http.get<any>(`https://plangton-production.up.railway.app/api/ArtWork/GetAllProducts`);
  }


  getProducts(page: number = 1, limit: number = 12): Observable<any> {
    let params: string[] = [];

    if (this.minPrice !== undefined) {
      params.push(`MinPrice=${this.minPrice}`);
    }
    if (this.maxPrice !== undefined) {
      params.push(`MaxPrice=${this.maxPrice}`);
    }

    // Sizes filter (send as comma separated)
    if (this.widthMinValues) {
      // encodeURIComponent to avoid issues with special characters
      params.push(`MinWidthCm=${encodeURIComponent(this.widthMinValues.join(','))}`);
    }

    if (this.widthMaxValues) {
      // encodeURIComponent to avoid issues with special characters
      params.push(`MaxWidthCm=${encodeURIComponent(this.widthMaxValues.join(','))}`);
    }

    if (this.heightMaxValues) {
      // encodeURIComponent to avoid issues with special characters
      params.push(`MaxHeightCm=${encodeURIComponent(this.heightMaxValues.join(','))}`);
    }

    if (this.heightMinValues) {
      // encodeURIComponent to avoid issues with special characters
      params.push(`MinHeightCm=${encodeURIComponent(this.heightMinValues.join(','))}`);
    }

    // Colors filter (comma separated color names)
    if (this.selectedColorsNames.length > 0) {
      params.push(`Color=${encodeURIComponent(this.selectedColorsNames.join(','))}`);
    }

    // Materials filter
    if (this.selectedMaterials.length > 0) {
      params.push(`Material=${encodeURIComponent(this.selectedMaterials.join(','))}`);
    }

    // Styles filter
    if (this.selectedStyles.length > 0) {
      params.push(`ArtStyle=${encodeURIComponent(this.selectedStyles.join(','))}`);
    }

    // Themes filter
    if (this.selectedThemes.length > 0) {
      params.push(`ArtTheme=${encodeURIComponent(this.selectedThemes.join(','))}`);
    }

    // Formats filter
    if (this.selectedFormats.length > 0) {
      params.push(`ArtWorkFormat=${encodeURIComponent(this.selectedFormats.join(','))}`);
    }

    // Types filter
    if (this.selectedTypes.length > 0) {
      params.push(`ArtworkType=${encodeURIComponent(this.selectedTypes.join(','))}`);
    }

    // Pagination params
    params.push(`Page=${page}`);    //// needs to be uncommented soon
    params.push(`Limit=${limit}`);                                                     ///////// needs to be uncommented soon

    const url = `https://plangton-production.up.railway.app/api/ArtWork/filter?` + params.join('&');

    console.log('Fetching products with URL:', url);
    
    return this.http.get<any>(url);
  }



  getProductById(id: string): Observable<any> {
    return this.http.get<any>(`https://plangton-production.up.railway.app/api/ArtWork/${id}`);
  }

  getArtistById(id: string): Observable<any> {
    return this.http.get<any>(`https://plangton-production.up.railway.app/api/Painters/GetArtistById/${id}`);
  }


  getAllArtists(initial: string = '', page: number = 1, limit: number = 12): Observable<any> {
    const initialParam = initial ? `initial=${initial}&` : '';
    const url = `https://artshop-backend-demo.fly.dev/artists?${initialParam}page=${page}&limit=${limit}`;

    const newUrl = `https://plangton-production.up.railway.app/api/Painters/GetAllArtists?` // needs page and limit add
   

    return this.http.get<any>(newUrl); /// updaed URL

    // https://plangton-production.up.railway.app/api/Painters/GetAllArtists needed to be changed soon
  }









}

