import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastHostComponent } from '@shared/presentation/components/toast/toast-host';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('electrolink-ng');
}
