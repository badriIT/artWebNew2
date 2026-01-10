import { Component } from '@angular/core';
import { ServiceService } from '../service.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-each-arter',
  standalone: false,
  templateUrl: './each-arter.component.html',
  styleUrl: './each-arter.component.css'
})
export class EachArterComponent {
  artistId!: string;
  artistInfo: any;

   formatPrice(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === '') return '';
    const s = String(value);
    const [intPart, decPart] = s.split('.');
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decPart ? `${withCommas}.${decPart}` : withCommas;
  }

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private service: ServiceService,
    private cartService: CartService
  ) { }




  ngOnInit() {

    
   
    this.route.paramMap.subscribe(params => {
      this.artistId = params.get('id')!;
      if (this.artistId) {
        this.loadArtistInfo(this.artistId);
      }
    });
  }

  loadArtistInfo(id: string) {
    this.service.getArtistById(id).subscribe(data => {
      this.artistInfo = data;
      console.log('Loaded artist info:', data);
    });
  }

  goBack() {
    this.location.back(); // navigates to the previous page in history
  }


}
