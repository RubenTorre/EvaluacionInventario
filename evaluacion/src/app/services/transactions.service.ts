import { HttpClient, HttpParams } from '@angular/common/http'; 
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Transaction {
  id?: number;
  date?: string;
  type: 'compra' | 'venta';
  productId: number;
  quantity: number;
  productName?: string;
  unitPrice: number;
  totalPrice?: number;
  details?: string;
}

export interface TransactionResponse {
  transactions: Transaction[];
  totalItems: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {

  private apiUrl = 'https://localhost:7162/api/transactions';

  constructor(private http: HttpClient) {}

  getTransactions(
    page: number = 1,
    pageSize: number = 10,
    type?: string,
    startDate?: string,
    endDate?: string
  ): Observable<TransactionResponse> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (type) params = params.set('type', type);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<TransactionResponse>(this.apiUrl, { params });
  }

  createTransaction(transaction: Transaction): Observable<any> {
    return this.http.post(this.apiUrl, transaction);
  }

  deleteTransaction(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getTransactionById(id: number): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.apiUrl}/${id}`);
  }

  updateTransaction(id: number, transaction: Transaction): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, transaction);
  }

}
