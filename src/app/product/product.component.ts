import { Component } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ServiceService } from '../service.service';

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent {
  transform = 'scale(1)';
  transformOrigin = 'center center';

  title!: string;
  artist!: string;
  price!: string;
  matherial!: string;
  style!: string;
  year!: string;
  img!: string;
  productId!: string;
  artistData: any;
  otherWorks: any[] = [];


  


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ServiceService
  ) { }

 
  loadProduct(id: string) {
    this.service.getProductById(id).subscribe(product => {
      if (!product) return;

      this.title = product.title;
      this.artist = product.artist_name;
      this.price = product.price;
      this.matherial = product.material;
      this.style = product.style;
      this.year = product.year_created;
      this.img = product.image;

      // Load artist's other works
      this.loadArtistData(product.artist_name);
    });
  }

  loadArtistData(name: string) {
  this.service.getArtists().subscribe((data: any) => {
    this.artistData = data.artists.find((a: any) =>
      a.artist_name.toLowerCase().trim() === name.toLowerCase().trim()
    );

    console.log("artist data", this.artistData);  // <-- Here, after assignment
    this.service.EachArtistsInfo = this.artistData;


    if (this.artistData) {
      this.otherWorks = this.artistData.featured_items.filter(
        (item: any) => item.id !== this.productId
      );
    }
  });
}


  changeProduct(art: any) {
    // Navigate to same route with different ID → triggers reload
    this.router.navigate(['/product', art.id]);
  }

  onMouseMove(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    this.transform = 'scale(2.5)';
    this.transformOrigin = `${x}% ${y}%`;
  }

  onMouseLeave() {
    this.transform = 'scale(1)';
    this.transformOrigin = 'center center';
  }



   ngOnInit() {

    // When ID changes (navigation inside same component)
     console.log("artist data",  this.artistData)
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id')!;
      if (this.productId) {
        this.loadProduct(this.productId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }



}
