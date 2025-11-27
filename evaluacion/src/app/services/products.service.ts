import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map } from 'rxjs';


export interface Product {
  id?: number;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  price: number;
  stock: number;
}
@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private apiUrl = 'https://localhost:7195/api/Products';

  constructor(private http: HttpClient) {}

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }
   uploadImage(file: File | null, currentUrl?: string): Observable<string> {
    if (!file) return of(currentUrl || ''); 
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/upload`, formData)
      .pipe(map(res => res.imageUrl));
  }

getProducts(
  page: number = 1,
  pageSize: number = 10,
  name?: string,
  category?: string,
  minPrice?: number,
  maxPrice?: number,
  minStock?: number,
  maxStock?: number
): Observable<{ products: Product[], totalItems: number }> {
  let params = `?page=${page}&pageSize=${pageSize}`;
  if (name) params += `&name=${name}`;
  if (category) params += `&category=${category}`;
  if (minPrice != null) params += `&minPrice=${minPrice}`;
  if (maxPrice != null) params += `&maxPrice=${maxPrice}`;
  if (minStock != null) params += `&minStock=${minStock}`;
  if (maxStock != null) params += `&maxStock=${maxStock}`;

  return this.http.get<{ products: Product[], totalItems: number }>(`${this.apiUrl}${params}`);
}



 updateProduct(id: number, product: Product): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  getProductById(id: number): Observable<Product> {
  return this.http.get<Product>(`${this.apiUrl}/${id}`);
}
getCategories(): Observable<string[]> {
  return this.http.get<string[]>(`${this.apiUrl}/categories`);
}


}