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
import { User } from './user/user/user';
import { Stockin } from './stockIn/stockin/stockin';
import { Stockout } from './stockIn/stockout/stockout';
import { EditStockIn } from './stockIn/edit-stock-in/edit-stock-in';
import { EditStockout } from './stockIn/edit-stockout/edit-stockout';
import { AddUserForm } from './add_users/add-user-form/add-user-form';
import { EditUser } from './add_users/edit-user/edit-user';
import { StockTransaction } from './transaction/stock-transaction/stock-transaction';
import { authGuard } from './auth-guard';
import { Dashboard } from './Dashobard/dashboard/dashboard';

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
    canActivate: [authGuard], // ✅ یہاں Auth Guard لگا دیا
    canActivateChild: [authGuard], // ✅ بچوں کے روٹس پر بھی لگے گا
    children: [
      { path: 'product_group', component: ProductGroupComponent },
      { path: 'stockIn_category', component: StockInComponent },
      { path: 'stockout_category', component: StockoutComponent },
      { path: 'add_product', component: AddProduct },
      { path: 'products', component: ProductsComponent },
      { path: 'users', component: User },
      { path: 'products/:id', component: EditProduct },
      { path: 'StockIn', component: Stockin },
      { path: 'add_user', component: AddUserForm },
      { path: 'stockout', component: Stockout },
      { path: 'edit_stockIn/:id', component: EditStockIn },
      { path: 'edit_stockout/:id', component: EditStockout },
      { path: 'edit_user/:id', component: EditUser },
      { path: 'stock_transaction', component: StockTransaction },
      { path: 'dashboard', component: Dashboard },
    ],
  },
];