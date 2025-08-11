import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
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

  constructor(private http: HttpClient) { }

  getProducts(page: number = 1, limit: number = 12): Observable<any> {
    let params: string[] = [];

    if (this.minPrice !== undefined) {
      params.push(`min_price=${this.minPrice}`);
    }
    if (this.maxPrice !== undefined) {
      params.push(`max_price=${this.maxPrice}`);
    }

    // Sizes filter (send as comma separated)
    if (this.selectedSizesLabels.length > 0) {
      // encodeURIComponent to avoid issues with special characters
      params.push(`size=${encodeURIComponent(this.selectedSizesLabels.join(','))}`);
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
      params.push(`format=${encodeURIComponent(this.selectedFormats.join(','))}`);
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
}
