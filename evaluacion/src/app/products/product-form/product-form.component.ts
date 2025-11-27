import { Component, ElementRef, ViewChild } from '@angular/core';
import { ProductsService, Product } from '../../services/products.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.css']
})
export class ProductFormComponent {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  product: Product = {
    name: '',
    description: '',
    category: '',
    imageUrl: '',
    price: 0,
    stock: 0
  };

  isEditMode = false;
  selectedFile: File | null = null;
  imagePreview: any = null;

  constructor(
    private productService: ProductsService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
  const nav = history.state;

  if (nav && nav.product) {
    this.isEditMode = true;
    this.product = nav.product; 
  }
}



  onFileSelected(event: any) {
    const file = event.target.files[0];
    this.selectedFile = file;

    if (file) {
      const reader = new FileReader();
      reader.onload = e => this.imagePreview = reader.result;
      reader.readAsDataURL(file);
    } else {
      this.imagePreview = null;
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
    this.product.imageUrl = '';

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

saveProduct() {
  if (!this.product.name || this.product.name.trim() === '') {
    Swal.fire({
      icon: 'warning',
      title: 'Campo obligatorio',
      text: 'Debe ingresar el nombre del producto'
    });
    return;
  }

  if (!this.product.category || this.product.category.trim() === '') {
    Swal.fire({
      icon: 'warning',
      title: 'Campo obligatorio',
      text: 'Debe ingresar la categoría del producto'
    });
    return;
  }

  if (!this.product.description || this.product.description.trim() === '') {
    Swal.fire({
      icon: 'warning',
      title: 'Campo obligatorio',
      text: 'Debe ingresar la descripción del producto'
    });
    return;
  }

  if (this.product.price === null || this.product.price <= 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Precio inválido',
      text: 'El precio debe ser mayor a 0'
    });
    return;
  }

  if (this.product.stock === null || this.product.stock < 0) {
    Swal.fire({
      icon: 'warning',
      title: 'Stock inválido',
      text: 'El stock no puede ser negativo'
    });
    return;
  }

  if (!this.product.imageUrl && !this.selectedFile) {
    Swal.fire({
      icon: 'warning',
      title: 'Campo obligatorio',
      text: 'Debe subir una imagen del producto'
    });
    return;
  }

  this.productService.uploadImage(this.selectedFile, this.product.imageUrl).subscribe({
    next: (imageUrl) => {
      this.product.imageUrl = imageUrl;

      if (this.isEditMode && this.product.id) {
        this.productService.updateProduct(this.product.id, this.product).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'Producto actualizado con éxito',
              confirmButtonText: 'OK'
            }).then(() => this.router.navigate(['/products']));
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo actualizar el producto'
            });
          }
        });
      } else {
        this.productService.createProduct(this.product).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Éxito!',
              text: 'Producto creado con éxito',
              confirmButtonText: 'OK'
            }).then(() => this.router.navigate(['/products']));
          },
          error: (err) => {
            console.error(err);
            const message = err?.error || 'No se pudo crear el producto';
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: message.includes('Ya existe un producto') 
            ? 'Ya existe un producto con ese nombre. Intente con otro nombre.'
            : message
            });
          }
        });
      }
    },
    error: (err) => {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo subir la imagen'
      });
    }
  });
}



}
