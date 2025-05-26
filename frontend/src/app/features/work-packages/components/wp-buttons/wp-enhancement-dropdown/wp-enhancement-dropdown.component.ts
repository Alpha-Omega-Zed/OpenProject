import { 
  ChangeDetectionStrategy, 
  Component, 
  EventEmitter,
  Output, 
  ViewChild,
  ElementRef,
  HostListener,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'opce-enhancement-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wp-enhancement-dropdown.component.html',
  styleUrl: './wp-enhancement-dropdown.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WpEnhancementDropdownComponent {
  @Output() undo = new EventEmitter<void>();
  @Output() redo = new EventEmitter<void>();
  @Output() toggleChanged = new EventEmitter<boolean>();

  @ViewChild("dropdown", { static: true }) dropdownRef!: ElementRef;

  constructor(private cdr: ChangeDetectorRef) {}

  public toggled = false; // Toggles the dropdown

  public setToggled(state: boolean) {
    this.toggleChanged.emit(state);
    if(state!=this.toggled){
      this.toggled = state;
      this.cdr.markForCheck();
      console.log(`Dropdown toggled: [${this.toggled}]`)
    }
  }

  // Listen for outside clicks and disable dropdown if detected
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedInside = this.dropdownRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.setToggled(false);
    }
  }
}
