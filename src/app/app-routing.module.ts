import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ArtersComponent } from './arters/arters.component';
import { ServicesCommunicateComponent } from './services-communicate/services-communicate.component';
import { ContactComponent } from './contact/contact.component';
import { ErrorInWorkComponent } from './error-in-work/error-in-work.component';
import { ProductComponent } from './product/product.component';
import { EachArterComponent } from './each-arter/each-arter.component';
import { ProductFromCatalogComponent } from './product-from-catalog/product-from-catalog.component';
import { EachArterFromCatalogComponent } from './each-arter-from-catalog/each-arter-from-catalog.component';
import { CartComponent } from './cart/cart.component';
import { LikedProductsComponent } from './liked-products/liked-products.component';



const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "arters", component: ArtersComponent },
  { path: "service-communicate", component: ServicesCommunicateComponent },
  { path: "contact", component: ContactComponent },
  { path: "cart", component: CartComponent },
  { path: "likedProducts", component: LikedProductsComponent },

  {
    path: 'product/:id',
    component: ProductComponent,
  },


  { path: "eachArter/:id", component: EachArterComponent },
  { path: "fromCatalog", component: ProductFromCatalogComponent },
  { path: "eachArterFromCatalog", component: EachArterFromCatalogComponent },


  { path: "**", component: ErrorInWorkComponent } // Wildcard route for a 404 page,
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' }) // ✅ important

  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
