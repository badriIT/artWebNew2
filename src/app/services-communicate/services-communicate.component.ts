import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-services-communicate',
  standalone: false,
  templateUrl: './services-communicate.component.html',
  styleUrl: './services-communicate.component.css'
})
export class ServicesCommunicateComponent implements AfterViewInit {


  
 
constructor(private router: Router) {}

 

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

}
