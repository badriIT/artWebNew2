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
    ProductComponent,
    EachArterComponent,
    ProductFromCatalogComponent,
    EachArterFromCatalogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule 
  ],
    
  
  providers: [
    provideClientHydration(withEventReplay())
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
