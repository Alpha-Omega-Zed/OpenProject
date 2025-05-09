import { ChangeDetectionStrategy, Input, Component, ElementRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'wp-enhance-button',
  standalone: true,
  imports: [],
  templateUrl: './wp-enhance-text-button.component.html',
  styleUrl: './wp-enhance-text-button.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WpEnhanceTextButtonComponent {
  @Output() clicked = new EventEmitter<void>();

  public loading = false; // Display loading indicator when enhancing

  onclick = () => {
    if(!this.loading){
      console.log("Button clicked"); // Add spinner <i class="fa-solid fa-spinner"></i> when loading (in .html)
      this.loading = true;
      this.clicked.emit();
    }
  }
}
