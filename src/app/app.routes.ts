import { Routes } from '@angular/router';
import { Login } from './create_account/login/login';
import { Sidebar } from './sidebar/sidebar/sidebar';
import { SignupComponent } from './create_account/signup/signup';
import { ProductGroupComponent } from './sidebar/product-group/product-group';
import { StockInComponent } from './category/stock-in/stock-in';
import { StockoutComponent } from './category/stockout/stockout';
import { AddProduct } from './add_product/add-product/add-product';
import { ProductsComponent } from './add_product/products/products';
import { EditProduct } from './add_product/edit-product/edit-product';

export const routes: Routes = [
  {
    path: '',
    component: Login,
  },
  {
    path: 'signup',
    component: SignupComponent,
  },

  {
    path: 'admin',
    component: Sidebar,
    children: [
      { path: 'product_group', component: ProductGroupComponent },
      { path: 'stockIn_category', component: StockInComponent },
      { path: 'stockout_category', component: StockoutComponent },
      { path: 'add_product', component: AddProduct },
      { path: 'products', component: ProductsComponent },
      { path: 'products/:id', component: EditProduct },
    ],
  },
];
