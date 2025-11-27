import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/products.component';
import { ProductFormComponent } from './products/product-form/product-form.component';
import { TransactionsComponent } from './transactions/transactions.component';
import { TransactionFormComponent } from './transactions/transaction-form/transaction-form.component';


export const routes: Routes = [
    { path: '', component: HomeComponent }, 
  { path: 'products', component: ProductsComponent }, 
  { path: 'products/new', component: ProductFormComponent }, 
  { path: 'products/edit', component: ProductFormComponent },
  { path: 'transactions', component: TransactionsComponent }, 
  { path: 'transactions/new', component: TransactionFormComponent }, 
  { path: 'transactions/edit', component: TransactionFormComponent }, 
  { path: '**', redirectTo: '' } 

];
