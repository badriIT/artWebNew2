import { ProductComponent } from './product/product.component';

export async function getPrerenderParams() {
  const products = await fetch('https://artshop-backend-demo.fly.dev/items').then(res => res.json());
  // assuming each product has an `id` property
  return products.map((product: any) => ({ id: product.id.toString() }));
}

export const serverRoutes = [
  {
    path: 'product/:id',
    component: ProductComponent,
    getPrerenderParams
  },
  // other routes you want to prerender
];
