import { Component } from '@angular/core';

@Component({
  selector: 'app-nav',
  standalone: false,
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {

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
