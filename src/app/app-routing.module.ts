import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ArtersComponent } from './arters/arters.component';
import { ServicesCommunicateComponent } from './services-communicate/services-communicate.component';
import { ContactComponent } from './contact/contact.component';
import { ErrorInWorkComponent } from './error-in-work/error-in-work.component';
import { ProductComponent } from './product/product.component';
import { EachArterComponent } from './each-arter/each-arter.component';

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "arters", component: ArtersComponent },
  { path: "service-communicate", component: ServicesCommunicateComponent },
  { path: "contact", component: ContactComponent },
  { path: "product", component: ProductComponent },
  { path: "eachArter", component: EachArterComponent },


  { path: "**", component: ErrorInWorkComponent } // Wildcard route for a 404 page,
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
