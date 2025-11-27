import { Component } from '@angular/core';
import { Transaction, TransactionsService } from '../services/transactions.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css'
})
export class TransactionsComponent {
  transactions: Transaction[] = [];
  totalItems = 0;
  page = 1;
  pageSize = 10;

  filterType?: string;
  filterStartDate?: string;
  filterEndDate?: string;

  constructor(private transactionService: TransactionsService,private router: Router) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

 loadTransactions(): void {
  const startDate = this.filterStartDate ? new Date(this.filterStartDate).toISOString().split('T')[0] : undefined;
  const endDate = this.filterEndDate ? new Date(this.filterEndDate).toISOString().split('T')[0] : undefined;

  this.transactionService.getTransactions(
    this.page,
    this.pageSize,
    this.filterType || undefined,
    startDate,
    endDate
  ).subscribe(res => {
    this.transactions = res.transactions;
    this.totalItems = res.totalItems;
  });
}


  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadTransactions();
  }

 applyFilters(): void {
  this.page = 1; 
  this.loadTransactions();
}

clearFilters(): void {
  this.filterType = '';
  this.filterStartDate = '';
  this.filterEndDate = '';
  this.page = 1;
  this.loadTransactions();
}


  editTransaction(transaction: any) {
  this.router.navigate(['/transactions/edit'], { state: { transaction } });
}


  deleteTransaction(transaction: Transaction) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminar la transacción del producto "${transaction.productName}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.transactionService.deleteTransaction(transaction.id!)
          .subscribe({
            next: () => {
              Swal.fire('Eliminado', 'La transacción se eliminó correctamente', 'success');
              this.loadTransactions(); 
            },
            error: err => {
              Swal.fire('Error', err.error || 'No se pudo eliminar la transacción', 'error');
            }
          });
      }
    });
  }
}
