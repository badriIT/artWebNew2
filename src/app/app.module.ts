import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavComponent } from './nav/nav.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { ArtersComponent } from './arters/arters.component';
import { ServicesCommunicateComponent } from './services-communicate/services-communicate.component';
import { ContactComponent } from './contact/contact.component';
import { ErrorInWorkComponent } from './error-in-work/error-in-work.component';
import { FormsModule } from '@angular/forms';
import { ProductComponent } from './product/product.component';
import { EachArterComponent } from './each-arter/each-arter.component';
import { ProductFromCatalogComponent } from './product-from-catalog/product-from-catalog.component';
import { EachArterFromCatalogComponent } from './each-arter-from-catalog/each-arter-from-catalog.component';
import { HttpClientModule } from '@angular/common/http';
import { CartComponent } from './cart/cart.component';
import { LikedProductsComponent } from './liked-products/liked-products.component';
import { AuthComponent } from './auth/auth.component';
import { PersonalComponent } from './personal/personal.component';
import { OffersComponent } from './offers/offers.component';
import { PreOrderDetailsComponent } from './pre-order-details/pre-order-details.component';


@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    FooterComponent,
    HomeComponent,
    ArtersComponent,
    ServicesCommunicateComponent,
    ContactComponent,
    ErrorInWorkComponent,

    EachArterComponent,
    ProductFromCatalogComponent,
    EachArterFromCatalogComponent,
    CartComponent,
    LikedProductsComponent,
    AuthComponent,
    PersonalComponent,
    OffersComponent,
    PreOrderDetailsComponent,
 
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule ,
    ProductComponent // <-- Import the ProductComponent here
    
  ],
    
  
  providers: [
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
