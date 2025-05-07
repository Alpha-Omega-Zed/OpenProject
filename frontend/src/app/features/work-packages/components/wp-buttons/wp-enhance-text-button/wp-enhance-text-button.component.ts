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

  onclick = () => {
    console.log("Button clicked")
    this.clicked.emit();
  }
}
