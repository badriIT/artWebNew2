import { Component } from '@angular/core';
import { ServiceService } from '../service.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-arters',
  standalone: false,
  templateUrl: './arters.component.html',
  styleUrl: './arters.component.css'
})
export class ArtersComponent {
  artists: any
  showPagination: boolean = true;
  noProdFound: boolean = false;

  products: any = [];
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalItems: number = 0;
  totalPages: number = 0;

  productsLoading: boolean = false;


  constructor(private service: ServiceService, private route: ActivatedRoute, private http: HttpClient, private cartService: CartService) {
   
  }






  georgianDigits: { label: string; value: string }[] = [
  { label: 'ა', value: 'ა' },
  { label: 'ბ', value: 'ბ' },
  { label: 'გ', value: 'გ' },
  { label: 'დ', value: 'დ' },
  { label: 'ე', value: 'ე' },
  { label: 'ვ', value: 'ვ' },
  { label: 'ზ', value: 'ზ' },
  { label: 'თ', value: 'თ' },
  { label: 'ი', value: 'ი' },
  { label: 'კ', value: 'კ' },
  { label: 'ლ', value: 'ლ' },
  { label: 'მ', value: 'მ' },
  { label: 'ნ', value: 'ნ' },
  { label: 'ო', value: 'ო' },
  { label: 'პ', value: 'პ' },
  { label: 'ჟ', value: 'ჟ' },
  { label: 'რ', value: 'რ' },
  { label: 'ს', value: 'ს' },
  { label: 'ტ', value: 'ტ' },
  { label: 'უ', value: 'უ' },
  { label: 'ფ', value: 'ფ' },
  { label: 'ქ', value: 'ქ' },
  { label: 'ღ', value: 'ღ' },
  { label: 'ყ', value: 'ყ' },
  { label: 'შ', value: 'შ' },
  { label: 'ჩ', value: 'ჩ' },
  { label: 'ც', value: 'ც' },
  { label: 'ძ', value: 'ძ' },
  { label: 'წ', value: 'წ' },
  { label: 'ჭ', value: 'ჭ' },
  { label: 'ხ', value: 'ხ' },
  { label: 'ჯ', value: 'ჯ' },
  { label: 'ჰ', value: 'ჰ' }
];



  EnglishDigits: { label: string; value: string }[] = [
  { label: 'a', value: 'a' },
  { label: 'b', value: 'b' },
  { label: 'c', value: 'c' },
  { label: 'd', value: 'd' },
  { label: 'e', value: 'e' },
  { label: 'f', value: 'f' },
  { label: 'g', value: 'g' },
  { label: 'h', value: 'h' },
  { label: 'i', value: 'i' },
  { label: 'j', value: 'j' },
  { label: 'k', value: 'k' },
  { label: 'l', value: 'l' },
  { label: 'm', value: 'm' },
  { label: 'n', value: 'n' },
  { label: 'o', value: 'o' },
  { label: 'p', value: 'p' },
  { label: 'q', value: 'q' },
  { label: 'r', value: 'r' },
  { label: 's', value: 's' },
  { label: 't', value: 't' },
  { label: 'u', value: 'u' },
  { label: 'v', value: 'v' },
  { label: 'w', value: 'w' },
  { label: 'x', value: 'x' },
  { label: 'y', value: 'y' },
  { label: 'z', value: 'z' },
 
];

selectedDigit!: string 


onDigitFilter(digit: string) {
  if (this.selectedDigit === digit) {
    this.selectedDigit = '';  // toggle off filter if clicked again
  } else {
    this.selectedDigit = digit;
  }
  this.currentPage = 1;
  this.loadData(this.currentPage);
}







  ngOnInit() {
    this.loadData(this.currentPage);
     
   
  }

loadData(page: number) {
    this.productsLoading = true;

  this.service.getAllArtists(this.selectedDigit, page, this.itemsPerPage).subscribe(response => {
    this.artists = response.artists || [];
    this.currentPage = response.page || page;
    this.itemsPerPage = response.limit || this.itemsPerPage;
    this.totalItems = response.total || 0;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    this.noProdFound = this.artists.length === 0;
    this.showPagination = this.totalPages > 0; // <-- Always show if at least one page
    console.log('Loaded artists:', this.artists);
    console.log('getDisplayedPages:', this.getDisplayedPages());

      this.productsLoading = false;
  });
}
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.loadData(page);
    }
  }

  firstPage() {
    this.goToPage(1);
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  lastPage() {
    this.goToPage(this.totalPages);
  }

  handlePageClick(page: number | string) {
    if (typeof page === 'number') {
      this.goToPage(page);
    }
  }

  getDisplayedPages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | null = null;

    range.push(1);

    let start = Math.max(current - delta, 2);
    let end = Math.min(current + delta, total - 1);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    range.push(total);

    for (const i of range) {
      if (l !== null) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l > 2) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }

}