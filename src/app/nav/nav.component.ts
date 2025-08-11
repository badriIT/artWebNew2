import { Component } from '@angular/core';
import { ServiceService } from '../service.service';

@Component({
  selector: 'app-nav',
  standalone: false,
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {





  constructor(private service: ServiceService,) {
    this.service.getWholeProcucts().subscribe(data => {
      this.WholeProducts = data.items
    })
  }



  searchTerm: string = '';
  WholeProducts: any[] = [];
  products: any[] = [];

  isProductsTabOpen: boolean = false; // controls popup visibility

  ngOnInit() {
    this.service.getWholeProcucts().subscribe(data => {
      this.WholeProducts = data.items;
      this.products = [...this.WholeProducts];
    });
  }

  onSearch() {




    setTimeout(() => {

      const term = this.searchTerm.trim().toLowerCase();

      if (term) {
        // Filter products
        this.products = this.WholeProducts.filter(p =>
          p.title.toLowerCase().includes(term)
        );

        // Show products popup
        this.isProductsTabOpen = true;
      } else {
        // Reset if search is empty
        this.products = [...this.WholeProducts];
        this.isProductsTabOpen = false;
      }

    }, 1200);

  }
























  searchActive: boolean = false;
  searchActive2: boolean = false;
  searchActive3: boolean = false;
  menuOpen = false;

  toogleSearch() {
    this.searchActive = !this.searchActive
  }

  toogleSearch2() {
    this.searchActive2 = !this.searchActive2
  }

  toogleSearch3() {
    this.searchActive3 = !this.searchActive3
  }


  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
