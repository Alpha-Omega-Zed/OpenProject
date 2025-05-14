import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'opce-enhance-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wp-enhance-text-button.component.html',
  styleUrl: './wp-enhance-text-button.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class WpEnhanceTextButtonComponent {
  @Output() clicked = new EventEmitter<void>();

  constructor(private cdr: ChangeDetectorRef) {}

  public loading = false; // Display loading indicator when enhancing

  onclick = () => {
    if(!this.loading){
      console.log("Button clicked");
      this.setLoading(true)
      this.clicked.emit();
    }
  }

  public setLoading(state:boolean){
    this.loading = state;
    this.cdr.markForCheck();
  }
}
