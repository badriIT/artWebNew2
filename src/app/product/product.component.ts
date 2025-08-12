import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceService } from '../service.service';
import { RouterModule } from '@angular/router';

@Component({
   selector: 'app-product',
  standalone: true,              // <-- Make it standalone
  imports: [CommonModule, RouterModule],  // <-- Add these imports
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
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
  ) {}

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

      console.log("artist data", this.artistData);
      this.service.EachArtistsInfo = this.artistData;

      if (this.artistData) {
        this.otherWorks = this.artistData.featured_items.filter(
          (item: any) => item.id !== this.productId
        );
      }
    });
  }

  changeProduct(art: any) {
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
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id')!;
      if (this.productId) {
        this.loadProduct(this.productId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }
}
