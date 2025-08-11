import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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

  constructor(private route: ActivatedRoute, private service: ServiceService) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.productId = params.get('id')!;
    });

    this.route.queryParams.subscribe(params => {
      this.title = params['title'] || '';
      this.artist = params['artist_name'] || '';
      this.price = params['price'] || '';
      this.matherial = params['matherial'] || '';
      this.style = params['style'] || '';
      this.year = params['year'] || '';
      this.img = params['img'] || '';

      console.log("authorName", this.artist);

      if (this.artist) {
        this.loadArtistData(this.artist);
      }
    });
  }

  loadArtistData(name: string) {
    this.service.getArtists().subscribe((data: any) => {
      this.artistData = data.artists.find((a: any) =>
        a.artist_name.toLowerCase().trim() === name.toLowerCase().trim()
      );

      if (this.artistData) {
        this.otherWorks = this.artistData.featured_items.filter((item: any) => item.id !== this.productId);
      }

      console.log("artistData inside subscribe:", this.artistData);
    });
  }































  onMouseMove(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    this.transform = 'scale(2.5)'; // zoom level
    this.transformOrigin = `${x}% ${y}%`;
  }

  onMouseLeave() {
    this.transform = 'scale(1)';
    this.transformOrigin = 'center center';
  }




}
