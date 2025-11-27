import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProductsService,Product } from '../services/products.service';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  imports: [RouterLink,CommonModule,FormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {
  products: Product[] = [];
  categories: string[] = [];    
   page: number = 1;
pageSize: number = 10;
filterName: string = '';
filterCategory: string = '';
totalItems: number = 0;
totalPages: number = 1;  
minPrice?: number;
maxPrice?: number;
minStock?: number;
maxStock?: number;      
constructor(private productService: ProductsService
  ,private router:Router
) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }




loadProducts() {
  this.productService.getProducts(
    this.page,
    this.pageSize,
    this.filterName,
    this.filterCategory,
    this.minPrice,
    this.maxPrice,
    this.minStock,
    this.maxStock
  ).subscribe({
    next: (res) => {
      this.products = res.products;
      this.totalItems = res.totalItems;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    },
    error: (err) => {
      console.error('Error al cargar productos', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los productos'
      });
    }
  });
}
edit(product: any) {
  this.router.navigate(['/products/edit'], { state: { product } });
}

loadCategories() {
  this.productService.getCategories().subscribe({
    next: (data) => this.categories = data,
    error: (err) => console.error('Error cargando categorías', err)
  });
}
clearFilters() {
  this.filterName = '';
  this.filterCategory = '';
  this.minPrice = undefined;
  this.maxPrice = undefined;
  this.minStock = undefined;
  this.maxStock = undefined;
  this.page = 1;
  this.loadProducts();
}

prevPage() {
  if (this.page > 1) {
    this.page--;
    this.loadProducts();
  }
}

nextPage() {
  if (this.page < this.totalPages) {
    this.page++;
    this.loadProducts();
  }
}



deleteProduct(id: number | undefined) {
  if (id === undefined) return; 

  Swal.fire({
    title: '¿Estás seguro?',
    text: '¡No podrás revertir esto!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Eliminado',
            text: 'El producto se ha eliminado con éxito',
            timer: 2000,
            showConfirmButton: false
          });
          this.loadProducts();
        },
        error: (err) => {
          console.error('Error al eliminar producto', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo eliminar el producto. Intente nuevamente.'
          });
        }
      });
    }
  });
}


}
