import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NavigationEnd,  Router,  RouterLink,  RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,CommonModule,RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'evaluacion';
   currentRoute: string = '';

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.url;
      }
    });
  }

  showSidebar(): boolean {
    return this.currentRoute !== '/';
  }
}
