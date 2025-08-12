import { Component } from '@angular/core';
import { ServiceService } from '../service.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-each-arter',
  standalone: false,
  templateUrl: './each-arter.component.html',
  styleUrl: './each-arter.component.css'
})
export class EachArterComponent {
    artistId!: string;
  artistInfo: any;

  constructor(
    private route: ActivatedRoute,
    private service: ServiceService
  ) {}

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
    
}
