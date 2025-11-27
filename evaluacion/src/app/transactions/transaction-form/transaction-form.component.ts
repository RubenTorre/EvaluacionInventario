import { Component } from '@angular/core';
import { Product, ProductsService } from '../../services/products.service';
import { Transaction, TransactionsService } from '../../services/transactions.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-transaction-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './transaction-form.component.html',
  styleUrl: './transaction-form.component.css'
})
export class TransactionFormComponent {
  transaction: Transaction = {
    type: 'compra',
    productId: 0,
    productName: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0
  };

  products: Product[] = [];
  isEditMode = false;
  transactionId?: number;

  productSearch: string = '';
  filteredProducts: Product[] = [];
  showSuggestions: boolean = false;

  constructor(
    private transactionsService: TransactionsService,
    private productsService: ProductsService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

 ngOnInit(): void {
  const nav = history.state;

  this.transactionId = nav?.transaction?.id ?? null;
  this.isEditMode = !!this.transactionId;

  this.productsService.getProducts().subscribe(res => {
    this.products = res.products;

    if (this.isEditMode && this.transactionId) {
      
      this.loadTransaction(this.transactionId);
    }
  });
}

loadTransaction(id: number): void {
  this.transactionsService.getTransactionById(id).subscribe(t => {
    this.transaction = t;

    const selectedProduct = this.products.find(p => p.id === t.productId);
    if (selectedProduct) {
      this.productSearch = selectedProduct.name;
      this.transaction.unitPrice = selectedProduct.price;
      this.updateTotalPrice();
    }
  });
}


  loadProducts(): void {
    this.productsService.getProducts().subscribe(res => {
      this.products = res.products;
    });
  }

 

  updateTotalPrice(): void {
    this.transaction.totalPrice = this.transaction.quantity * this.transaction.unitPrice;
  }

  save() {
    if (!this.transaction.type) {
      Swal.fire('Campo obligatorio', 'Debes seleccionar tipo de transacción', 'warning');
      return;
    }

    if (!this.transaction.productId) {
      Swal.fire('Campo obligatorio', 'Debes seleccionar un producto', 'warning');
      return;
    }

    if (!this.transaction.quantity || this.transaction.quantity <= 0) {
      Swal.fire('Campo obligatorio', 'La cantidad debe ser mayor que cero', 'warning');
      return;
    }

    if (!this.transaction.unitPrice || this.transaction.unitPrice <= 0) {
      Swal.fire('Campo obligatorio', 'El precio unitario debe ser mayor que cero', 'warning');
      return;
    }
    if (!this.transaction.details || this.transaction.details.trim() === '') {
      Swal.fire('Campo obligatorio', 'Debe ingresar la descripción', 'warning');
      return;
    }


    if (this.isEditMode) {
      this.transactionsService.updateTransaction(this.transactionId!, this.transaction)
        .subscribe({
          next: () => {
            Swal.fire('Actualizado', 'Transacción actualizada correctamente', 'success');
            this.router.navigate(['/transactions']);
          },
          error: err => Swal.fire('Error', err.error || 'Error al actualizar transacción', 'error')
        });
    } else {
      this.transactionsService.createTransaction(this.transaction)
        .subscribe({
          next: () => {
            const tipo = this.transaction.type === 'compra' ? 'Compra' : 'Venta';
            Swal.fire('Creado', `Transacción de ${tipo} registrada correctamente`, 'success').then(() => {
              this.router.navigate(['/transactions']);
            });
          },
    error: (err) => {
          Swal.fire('Error', err.error || 'Error al actualizar transacción', 'error');
        
}

        });
    }
  }

  cancel(): void {
    this.router.navigate(['/transactions']);
  }

  filterProducts() {
    const search = this.productSearch.trim().toLowerCase();

    if (!search) {
      this.filteredProducts = [];
      this.showSuggestions = false;
      return;
    }

    this.filteredProducts = this.products
      .filter(p => p.name.toLowerCase().includes(search))
      .slice(0, 10);
    this.showSuggestions = this.filteredProducts.length > 0;
  }


  selectProduct(product: Product) {
    this.transaction.productId = product.id!;
    this.transaction.productName = product.name;
    this.transaction.unitPrice = product.price;
    this.transaction.totalPrice = this.transaction.unitPrice * this.transaction.quantity;

    this.productSearch = product.name;
    this.showSuggestions = false;
  }


  onBlur() {
    setTimeout(() => this.showSuggestions = false, 200);
  }
}
