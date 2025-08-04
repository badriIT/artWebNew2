import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit {



  selectedPrice: string = '';




  isFilterOpen = false;
  isSortOpen = false;

  openFilter() {
    this.isFilterOpen = true;
    this.isSortOpen = false;
  }

  openSort() {
    this.isSortOpen = true;
    this.isFilterOpen = false;
  }

  closePanels() {
    this.isFilterOpen = false;
    this.isSortOpen = false;
  }





  ngAfterViewInit() {
    const titles = document.querySelectorAll('.accordion-title');

    titles.forEach(title => {
      title.addEventListener('click', () => {
        const content = title.nextElementSibling as HTMLElement;
        const isOpen = content.classList.contains('open');

        if (isOpen) {
          content.style.height = content.scrollHeight + 'px';
          requestAnimationFrame(() => {
            content.style.height = '0px';
          });
          content.classList.remove('open');
          title.classList.remove('centered');
        } else {
          content.classList.add('open');
          content.style.height = content.scrollHeight + 'px';

          setTimeout(() => {
            title.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);

          title.classList.add('centered');

          const clearHeight = () => {
            content.style.height = 'auto';
            content.removeEventListener('transitionend', clearHeight);
          };
          content.addEventListener('transitionend', clearHeight);
        }
      });
    });
  }

  selectedColors: Set<number> = new Set();

  toggleColor(index: number): void {
    if (this.selectedColors.has(index)) {
      this.selectedColors.delete(index);
    } else {
      this.selectedColors.add(index);
    }
  }



}
