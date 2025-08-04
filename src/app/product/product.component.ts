import { Component } from '@angular/core';

@Component({
  selector: 'app-product',
  standalone: false,
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent {
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
