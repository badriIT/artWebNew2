import { Component, AfterViewInit } from '@angular/core';
import { ServiceService } from '../service.service';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit {













  // Price ranges
  priceRanges = [
    { label: '300 ლარამდე', min: undefined, max: 300 },
    { label: '300 - 2000 ლარი', min: 300, max: 2000 },
    { label: '2000 - 3000 ლარი', min: 2000, max: 3000 },
    { label: '3000 - 5000 ლარი', min: 3000, max: 5000 },
    { label: '5000 - 9000 ლარი', min: 5000, max: 9000 },
    { label: '9000 - 11000 ლარი', min: 9000, max: 11000 },
    { label: '11000 ლარზე მეტი', min: 11000, max: undefined }
  ];

  sizes = [
    { label: 'პატარა (30 × 30 CM მდე)', heightMin: undefined, widthMin: undefined, heightMax: 30, widthMax: 30 },
    { label: 'საშუალო ( 80 × 80 CM მდე)', heightMin: 30, widthMin: 30, heightMax: 80, widthMax: 80 },
    { label: 'მსხცვილი ( 80 × 80 CM ზე მეტი)', heightMin: 80, widthMin: 80, heightMax: 150, widthMax: 150 },
    { label: '150CM ზე მეტი', heightMin: 150, widthMin: 150, heightMax: undefined, widthMax: undefined },
  ];

  selectedSizes: string[] = [];


  onSizeChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;

    if (checkbox.checked) {
      if (!this.selectedSizes.includes(value)) {
        this.selectedSizes.push(value);
      }
    } else {
      this.selectedSizes = this.selectedSizes.filter(v => v !== value);
    }

    const selectedObjects = this.getSelectedSizeObjects();
    console.log('Selected size objects:', selectedObjects);
  }


  getSelectedSizeObjects() {
    return this.sizes.filter(size => this.selectedSizes.includes(size.label));
  }









  selectedPriceRange?: { min?: number; max?: number };
  minPrice?: number;
  maxPrice?: number;
  noProdFound: boolean = false;

  showPagination: boolean = true;

  filter() {
    this.closePanels();
    this.currentPage = 1;

    // update service filters
    this.service.minPrice = this.selectedPriceRange?.min;
    this.service.maxPrice = this.selectedPriceRange?.max;
    this.service.selectedColorsNames = this.selectedColorNames;
    this.service.selectedSizesLabels = this.selectedSizes;
    this.service.selectedMaterials = this.selectedMaterials;
    this.service.selectedStyles = this.selectedStyles;
    this.service.selectedThemes = this.selectedThemes;
    this.service.selectedFormats = this.selectedFormats;
    this.service.selectedTypes = this.selectedTypes;

    const selectedObjects = this.getSelectedSizeObjects();
    this.service.widthMaxValues = selectedObjects.map(s => s.widthMax);
    this.service.widthMinValues = selectedObjects.map(s => s.widthMin);
    this.service.heightMaxValues = selectedObjects.map(s => s.heightMax);
    this.service.heightMinValues = selectedObjects.map(s => s.heightMin);

    // fetch filtered products
    this.service.getProducts(this.currentPage, this.itemsPerPage).subscribe(data => {
      this.products = data.items;
      this.totalItems = data.total;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

      this.noProdFound = this.products.length === 0;
      this.showPagination = !this.noProdFound;

      console.log("Filtered products", this.products);
    });
  }

  unfilter() {
    this.closePanels();
    this.currentPage = 1;

    // clear filters in service
    this.service.minPrice = undefined;
    this.service.maxPrice = undefined;
    this.service.widthMaxValues = undefined;
    this.service.widthMinValues = undefined;
    this.service.heightMaxValues = undefined;
    this.service.heightMinValues = undefined;

    this.service.selectedColorsNames = [];
    this.service.selectedSizesLabels = [];
    this.service.selectedMaterials = [];
    this.service.selectedStyles = [];
    this.service.selectedThemes = [];
    this.service.selectedFormats = [];
    this.service.selectedTypes = [];

    // fetch all products
    this.service.getProducts(this.currentPage, this.itemsPerPage).subscribe(data => {
      this.products = data.items;
      this.totalItems = data.total;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

      this.noProdFound = this.products.length === 0;
      this.showPagination = !this.noProdFound;

      console.log("Unfiltered products", this.products);
    });
  }


  colorLabels: { [key: number]: string } = {
    0: 'კრემისფერი', 1: 'თეთრი', 2: 'ღია ნარინჯისფერი', 3: 'ბრინჯაოსფერი', 4: 'ცისფერი',
    5: 'ყვითელი', 6: 'მწვანე', 7: 'ოქროსფერი', 8: 'ყავისფერი', 9: 'წითელი',
    10: 'იისფერი', 11: 'ნარინჯისფერი', 12: 'ვარდისფერი', 13: 'ღია მწვანე', 14: 'ვერცხლისფერი',
    15: 'ნაცრისფერი', 16: 'ლურჯი', 17: 'მუქი მწვანე', 18: 'იასამნისფერი', 19: 'შავი'
  };



  colorMap: { [key: number]: string } = {
    0: 'cream', 1: 'white', 2: 'light-orange', 3: 'bronze', 4: 'blue',
    5: 'yellow', 6: 'green', 7: 'gold', 8: 'brown', 9: 'red',
    10: 'purple', 11: 'orange', 12: 'pink', 13: 'light-green', 14: 'silver',
    15: 'gray', 16: 'navy', 17: 'dark-green', 18: 'violet', 19: 'black'
  };
  selectedColors = new Set<number>();

  toggleColor(colorId: number) {
    if (this.selectedColors.has(colorId)) {
      this.selectedColors.delete(colorId);
    } else {
      this.selectedColors.add(colorId);
    }
  }

  getColorIds(): number[] {
    return Object.keys(this.colorMap).map(id => +id);
  }

  get selectedColorNames(): string[] {
    return Array.from(this.selectedColors).map(id => this.colorMap[id]);
  }






  // Materials — must match backend values
  materials = [
    { label: 'ლედ ნეონი', value: 'led_neon' },
    { label: 'ალუმინი', value: 'aluminum' },
    { label: 'ვინილი', value: 'vinyl' },
    { label: 'უჟანგავი ფოლადი', value: 'stainless_steel' },
    { label: 'პოლიმერული ფაიფური', value: 'polymer_board' },
    { label: 'ბრინგის ქაღალდი', value: 'blotting_paper' },
    { label: 'ცემენტი', value: 'cement' },
    { label: 'მელანი', value: 'ink' },
    { label: 'ავტორის ბეჭედი', value: 'artist_stamp' },
    { label: 'აკვარელი', value: 'watercolor' },
    { label: 'აკრილი', value: 'acrylic' },
    { label: 'ბეტონი', value: 'concrete' },
    { label: 'ბრინჯაო', value: 'bronze' },
    { label: 'ქაღალდი', value: 'paper' },
    { label: 'თაბაშირი', value: 'charcoal' },
    { label: 'ხე', value: 'wood' },
    { label: 'ხელოვნური ქვა', value: 'artificial_stone' },
    { label: 'ქვა', value: 'stone' },
    { label: 'კარდონი', value: 'cardboard' },
    { label: 'კერამიკა', value: 'ceramic' },
    { label: 'კოლაჟი', value: 'collage' },
    { label: 'გესო', value: 'gesso' },
    { label: 'ლინოგრავიტურა', value: 'linocut' },
    { label: 'მეტალი', value: 'metal' },
    { label: 'მოზაიკა', value: 'mosaic' },
    { label: 'მყარი დაფა', value: 'hardboard' },
    { label: 'გადამუშავებული პლასტმასი', value: 'processed_plastic' },
    { label: 'პლასტმასი', value: 'plastic' },
    { label: 'შერეული ტექნიკა', value: 'mixed_media' },
    { label: 'მინა', value: 'glass' },
    { label: 'მინაბოჭკოვანი', value: 'glass_fiber' },
    { label: 'გამოცემის ბეჭდვა', value: 'print_edition' },
    { label: 'ფანერა', value: 'plywood' },
    { label: 'ფაიფური', value: 'canvas' },
    { label: 'ფოტო ქაღალდი', value: 'photo_paper' },
    { label: 'ფოტო', value: 'photo' },
    { label: 'ბამბა', value: 'cotton' },
    { label: 'ტილო', value: 'fabric' },
    { label: 'ციფრული ფოტოგრაფია', value: 'digital_photography' },
    { label: 'შამოტი', value: 'shamotte' },
    { label: 'ეგლომიზე', value: 'encaustic' },
    { label: 'PETG', value: 'petg' },
    { label: 'აკრილის მინანქარი', value: 'acrylic_cast' },
    { label: 'აკრილის მინა', value: 'acrylic_glass' },
    { label: 'აკრილის თაბაშირი', value: 'acrylic_charcoal' },
    { label: 'აკრილის თოკი', value: 'acrylic_string' },
    { label: 'ალკიდის საღებავი', value: 'alkyd_paint' },
    { label: 'ამბროტიპი', value: 'ambrotype' },
    { label: 'საარქივო ქაღალდი', value: 'archival_paper' },
    { label: 'საარქივო ფოტოქაღალდი', value: 'archival_photo_paper' },
    { label: 'ასფალტი', value: 'asphalt' },
    { label: 'სპრეი საღებავი', value: 'spray_paint' },
    { label: 'ბრეზენტი', value: 'tarpaulin' },
    { label: 'ბარი', value: 'bar' },
    { label: 'გაზეთი', value: 'newspaper' },
    { label: 'თაბაშირ-მუყაო', value: 'charcoal_clay' },
    { label: 'მინანქარი', value: 'cast' },
    { label: 'თიხა', value: 'clay' },
    { label: 'გრანიტი', value: 'granite' },
    { label: 'გრაფიტი', value: 'graffiti' },
    { label: 'გუაში', value: 'gouache' },
    { label: 'ბოჭკოვანი დაფა', value: 'fiberboard' },
    { label: 'სტიკერი', value: 'sticker' },
    { label: 'დიბონდი', value: 'dibond' },
    { label: 'ჟიკლი', value: 'giclée' },
    { label: 'მინის ქარალდი', value: 'glass_paper' },
    { label: 'მინის მოზაიკა', value: 'glass_mosaic' },
    { label: 'ოქრო', value: 'gold' },
    { label: 'მოოქროებული', value: 'gilded' },
    { label: 'ირიდესცენტური ფირი', value: 'iridescent_film' },
    { label: 'ხელოვნური ქვები', value: 'artificial_stones' },
    { label: 'სახაზავი ქაღალდი', value: 'tracing_paper' },
    { label: 'ქვის მასა', value: 'stone_mass' },
    { label: 'ფანქარი', value: 'pencil' },
    { label: 'კერამიკული ფილა', value: 'ceramic_tile' },
    { label: 'ფერი', value: 'paint' },
    { label: 'კომპოზიტი', value: 'composite' },
    { label: 'ფესვები', value: 'roots' },
    { label: 'ყავის ტომარა', value: 'coffee_bag' },
    { label: 'კრაფტის ქაღალდი', value: 'kraft_paper' },
    { label: 'ლაქი', value: 'lacquer' },
    { label: 'ლინზური ვარიო ბეჭდვა', value: 'lenticular_vario_print' },
    { label: 'ლაინერები', value: 'liners' },
    { label: 'ლინზური რასტერი', value: 'lenticular_raster' },
    { label: 'ლითოგრაფია', value: 'lithography' },
    { label: 'ქასთინგი', value: 'casting' },
    { label: 'მარკერები', value: 'markers' },
    { label: 'ზეთი', value: 'oil' },
    { label: 'MDF', value: 'mdf' },
    { label: 'საშუალო', value: 'medium' },
    { label: 'ცარცი', value: 'tempera' },
    { label: 'ცარცის მუყაო', value: 'tempera_clay' },
    { label: 'ცარცის საღებავები', value: 'tempera_paints' },
    { label: 'მინერალური საღებავები', value: 'mineral_paints' },
    { label: 'მოდელის ფისი', value: 'model_glue' },
    { label: 'ხავსი', value: 'hemp' },
    { label: 'მარმარილო', value: 'marble' },
    { label: 'გრავირება', value: 'engraving' },
    { label: 'პასტელი', value: 'pastel' },
    { label: 'პატინა', value: 'patina' },
    { label: 'პოლივინილქლორიდი', value: 'pvc' },
    { label: 'ქაფის დაფა', value: 'foam_board' },
    { label: 'პოლისტიროლის ქაფი', value: 'polystyrene_foam' },
    { label: 'ქვიშა', value: 'sand' },
    { label: 'პლანშეტი', value: 'tablet' },
    { label: 'პლასტიზაცია', value: 'plastizine' },
    { label: 'პლატინა', value: 'platinum' },
    { label: 'ფირი', value: 'film' },
    { label: 'პოლიმერული თიხა', value: 'polymer_clay' },
    { label: 'პოლიმერული შპაკლი', value: 'polymer_spackle' },
    { label: 'პოლისტოუნი', value: 'polystone' },
    { label: 'ნახევრად ფაიფური', value: 'semi_canvas' },
    { label: 'პოტალი', value: 'potale' },
    { label: 'PFH', value: 'pfh' },
    { label: 'ჩარჩო', value: 'frame' },
    { label: 'თვითმოსმენის ხრახნი', value: 'headphone_springs' },
    { label: 'ლუმინესცენტური საღებავები', value: 'fluorescent_paint' },
    { label: 'ვერცხლი', value: 'silver' },
    { label: 'სმალტი', value: 'smalt' },
    { label: 'ფისი', value: 'glue' },
    { label: 'ფოლადი', value: 'steel' },
    { label: 'ოქროს ფოთოლი', value: 'gold_leaf' },
    { label: 'მშრალი ნემსი', value: 'dry_needle' },
    { label: 'მშრალი პიგმენტი', value: 'dry_pigment' },
    { label: 'ნაქარგი ტილო', value: 'waste_fabric' },
    { label: 'ტექსტილი', value: 'textile' },
    { label: 'ტექსტური პასტა', value: 'textured_paste' },
    { label: 'ტექსტურის გელი', value: 'texture_gel' },
    { label: 'ტემპერა', value: 'tempera' },
    { label: 'საბეჭდი მელანი', value: 'inkjet_ink' },
    { label: 'შეფერილობის ფილმი', value: 'coloring_film' },
    { label: 'ტუში', value: 'ink_wash' },
    { label: 'ქვანახშირი', value: 'coal' },
    { label: 'ფასადის საღებავი', value: 'facade_paint' },
    { label: 'ბამბის ძაფი', value: 'cotton_thread' },
    { label: 'ქრომი', value: 'chrome' },
    { label: 'ციფრული ხატვა', value: 'digital_drawing' },
    { label: 'ციფრული ბეჭდვა', value: 'digital_print' },
    { label: 'ციფრული კოლაჟი', value: 'digital_collage' },
    { label: 'შამოტის მასა', value: 'shamotte_mass' },
    { label: 'აბრეშუმი', value: 'silk' },
    { label: 'აბრეშუმის ტრაფარეტული ბეჭდვა', value: 'silk_screen_print' },
    { label: 'შალის ძაფი', value: 'scarf_thread' },
    { label: 'ეკო ტყავი', value: 'eco_leather' },
    { label: 'ეპოქსიდური ფისი', value: 'epoxy_glue' },
    { label: 'იაპონური მელანი', value: 'japanese_ink' }
  ];

  selectedMaterials: string[] = [];

  onMaterialChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;

    if (checkbox.checked) {
      if (!this.selectedMaterials.includes(value)) {
        this.selectedMaterials.push(value);
      }
    } else {
      this.selectedMaterials = this.selectedMaterials.filter(v => v !== value);
    }

    console.log('Selected types:', this.selectedMaterials);
  }


  styles = [
    { label: 'აბსტრაქციონიზმი', value: 'abstract' },
    { label: 'კუბიზმი', value: 'cubism' },
    { label: 'ნატურმორტი', value: 'still_life' },
    { label: 'პეიზაჟი', value: 'landscape' },
    { label: 'პორტრეტი', value: 'portrait' },
    { label: 'პოპ-არტი', value: 'pop_art' },
    { label: 'აქტუალური ხელოვნება', value: 'contemporary_art' },
    { label: 'გეომეტრიული აბსტრაქციონიზმი', value: 'geometric_abstraction' },
    { label: 'რეალიზმი', value: 'realism' },
    { label: 'ჰიპერრეალიზმი', value: 'hyperrealism' },
    { label: 'იმპრესიონიზმი', value: 'impressionism' },
    { label: 'მოდერნიზმი', value: 'modernism' },
    { label: 'სიურეალიზმი', value: 'surrealism' },
    { label: 'ფიგურული ხელოვნება', value: 'figurative_art' },
    { label: 'ციფრული ხელოვნება', value: 'digital_art' },
    { label: 'მაგიური რეალიზმი', value: 'magical_realism' },
    { label: 'პრიმიტიზმი', value: 'primitivism' },
    { label: 'სოცრეალიზმი', value: 'socrealism' }
  ];

  selectedStyles: string[] = [];


  onStyleChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;

    if (checkbox.checked) {
      if (!this.selectedStyles.includes(value)) {
        this.selectedStyles.push(value);
      }
    } else {
      this.selectedStyles = this.selectedStyles.filter(v => v !== value);
    }

    console.log('Selected types:', this.selectedStyles);
  }

  themes = [
    { label: 'აქტუალური ხელოვნება', value: 'contemporary_art' },
    { label: 'ქველმოქმედება', value: 'underground' },
    { label: 'ცხოველები', value: 'animals' },
    { label: 'სიყვარული', value: 'love' },
    { label: 'მოდერნ', value: 'modern' },
    { label: 'ახალი', value: 'new' },
    { label: 'პოპ-არტი', value: 'pop_art' },
    { label: 'სიუჟეტი', value: 'subject' },
    { label: 'ფიგურატიზმი', value: 'figuratism' },
    { label: 'ქალაქი', value: 'city' },
    { label: 'ბუნება', value: 'nature' },
    { label: 'სქესი', value: 'sex' },
    { label: 'მოდა', value: 'fashion' },
    { label: 'მისთვის', value: 'gift' },
    { label: 'მისთვის (გოგო)', value: 'for_girl' },
    { label: 'მისთვის (ბიჭი)', value: 'for_boy' },
    { label: 'საჩუქარი', value: 'gift' },
    { label: 'პორტრეტი', value: 'portrait' },
    { label: 'პეიზაჟი', value: 'landscape' },
    { label: 'ნატურმორტი', value: 'still_life' },
    { label: 'რეალიზმი', value: 'realism' },
    { label: 'ზღვა', value: 'sea' }
  ];


  selectedThemes: string[] = [];




  onThemeChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;

    if (checkbox.checked) {
      if (!this.selectedThemes.includes(value)) {
        this.selectedThemes.push(value);
      }
    } else {
      this.selectedThemes = this.selectedThemes.filter(v => v !== value);
    }

    console.log('Selected types:', this.selectedThemes);
  }

  formats = [
    { label: 'ჰორიზონტალური', value: 'horizontal' },
    { label: 'ფიგურატიზმი', value: 'figurative' },
    { label: 'ვერტიკალური', value: 'vertical' },
    { label: 'კვადრატი', value: 'square' },
    { label: 'წრე', value: 'circle' },
    { label: 'ოვალური', value: 'oval' },
    { label: 'დიპტიქი', value: 'diptych' },
    { label: 'პოლიპტიქი', value: 'polyptych' },
    { label: 'სხვა', value: 'other' },
    { label: 'ტრიპტიქი', value: 'triptych' }
  ];

  selectedFormats: string[] = [];


  onFormatChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;

    if (checkbox.checked) {
      if (!this.selectedFormats.includes(value)) {
        this.selectedFormats.push(value);
      }
    } else {
      this.selectedFormats = this.selectedFormats.filter(v => v !== value);
    }

    console.log('Selected types:', this.selectedFormats);
  }




  types = [
    { label: 'ფერწერა', value: 'painting' },
    { label: 'ბრტყელი ქანდაკება', value: 'flat_sculpture' },
    { label: 'ქანდაკება', value: 'sculpture' },
    { label: 'ნამუშევარი ქაღალდზე', value: 'paper_work' },
    { label: 'ფოტოგრაფია', value: 'photography' },
    { label: 'დეკორატიული და გამოყენებითი ხელოვნება', value: 'decorative_applied' },
    { label: 'სხვა', value: 'other' }
  ];

  // This array will hold selected types' values
  selectedTypes: string[] = [];


  onTypeChange(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;

    if (checkbox.checked) {
      if (!this.selectedTypes.includes(value)) {
        this.selectedTypes.push(value);
      }
    } else {
      this.selectedTypes = this.selectedTypes.filter(v => v !== value);
    }

    console.log('Selected types:', this.selectedTypes);
  }
































  handlePageClick(page: number | string): void {
    if (typeof page === 'number') {
      this.goToPage(page);
    }
  }


  products: any[] = []



  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalItems: number = 0;
  totalPages: number = 0;





  getDisplayedPages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;  // number of pages around current to show

    if (total <= 7) {
      // Show all pages if total pages are small
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const range = [];
    const rangeWithDots = [];
    let l: number | null = null;

    // Always show first page
    range.push(1);

    // Pages around current page
    let start = Math.max(current - delta, 2);
    let end = Math.min(current + delta, total - 1);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Always show last page
    range.push(total);

    for (let i of range) {
      if (l !== null) {
        if (i - l === 2) {
          // Add the missing page
          rangeWithDots.push(l + 1);
        } else if (i - l > 2) {
          // Add dots for gap bigger than 1
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  }




  loadData(page: number) {
    this.service.getProducts(page, this.itemsPerPage).subscribe(response => {
      this.products = response.items;
      this.currentPage = response.page;
      this.itemsPerPage = response.limit;
      this.totalItems = response.total;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

      console.log(this.products)
    });
  }

  firstPage() {
    this.goToPage(1);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.service.getProducts(this.currentPage, this.itemsPerPage).subscribe(data => {
        this.products = data.items;
        this.noProdFound = this.products.length === 0;
        this.showPagination = !this.noProdFound;
      });
    }
    if (page >= 1 && page <= this.totalPages) {
      this.loadData(page);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  lastPage() {
    console.log('totalPages:', this.totalPages);
    this.goToPage(this.totalPages);
  }


  prevPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }



  constructor(private service: ServiceService, private route: ActivatedRoute, private http: HttpClient, private cartService: CartService) {
    this.service.getProducts().subscribe(data => {
      this.products = data.items
      console.log(this.products)

    })




  }


  ngOnInit() {
    this.cartService.updateCartCount();
    this.service.getGuestToken();
    this.loadData(this.currentPage);
    const id = this.route.snapshot.paramMap.get('id');



    this.service.minPrice = undefined;
    this.service.maxPrice = undefined;


    this.service.widthMaxValues = undefined

    this.service.widthMinValues = undefined

    this.service.heightMaxValues = undefined

    this.service.heightMinValues = undefined


    this.service.selectedColorsNames = [] // from your component Set
    this.service.selectedSizesLabels = []    // from your component selectedSizes array
    this.service.selectedMaterials = []
    this.service.selectedStyles = []
    this.service.selectedThemes = []
    this.service.selectedFormats = []
    this.service.selectedTypes = []



  }









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



  originalProducts() {
    this.service.getProducts().subscribe(data => {
      this.products = data.items;
      console.log("original products", this.products);
      this.noProdFound = false;
    });
  }

  priceUp() {
    this.products.sort((b, a) => a.price - b.price);
    console.log("products sorted by price ascending", this.products);
  }

  priceDown() {
    this.products.sort((a, b) => a.price - b.price);
    console.log("products sorted by price descending", this.products);
  }

  News() {
    this.products.sort((a, b) => b.year_created - a.year_created);
    console.log("products sorted by price descending", this.products);
  }










}
