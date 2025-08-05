import { Component } from '@angular/core';

@Component({
  selector: 'app-product-from-catalog',
  standalone: false,
  templateUrl: './product-from-catalog.component.html',
  styleUrl: './product-from-catalog.component.css'
})
export class ProductFromCatalogComponent {
  transform = 'scale(1)';
  transformOrigin = 'center center';

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
