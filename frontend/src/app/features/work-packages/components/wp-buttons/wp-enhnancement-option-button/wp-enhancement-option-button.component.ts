import { 
  ChangeDetectionStrategy, 
  Component, 
  EventEmitter, 
  Input,
  Output 
} from '@angular/core';

@Component({
  selector: 'opce-enhancement-option-button',
  standalone: true,
  imports: [],
  templateUrl: './wp-enhancement-option-button.component.html',
  styleUrl: './wp-enhancement-option-button.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WpEnhancementOptionButtonComponent {
  @Input() disabled = false;
  @Output() trigger: EventEmitter<void> = new EventEmitter<void>();

  onClick() {
    console.log("Option clicked!");
    this.trigger.emit();
  }
}
