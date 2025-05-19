import { 
  ChangeDetectionStrategy, 
  Component, 
  EventEmitter,
  Output, 
  ViewChild,
  AfterViewInit,
  ElementRef,
  HostListener,
} from '@angular/core';
import { WpEnhancementOptionButtonComponent } from '../wp-enhnancement-option-button/wp-enhancement-option-button.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'opce-enhancement-dropdown',
  standalone: true,
  imports: [WpEnhancementOptionButtonComponent, CommonModule],
  templateUrl: './wp-enhancement-dropdown.component.html',
  styleUrl: './wp-enhancement-dropdown.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WpEnhancementDropdownComponent implements AfterViewInit {
  @Output() undo = new EventEmitter<void>();
  @Output() redo = new EventEmitter<void>();
  @ViewChild("dropdown", { static: true }) dropdownRef!: ElementRef;
  @ViewChild("undo",     { static: true }) undoButton!: WpEnhancementOptionButtonComponent;
  @ViewChild("redo",     { static: true }) redoButton!: WpEnhancementOptionButtonComponent;

  public toggled = false; // Toggles the dropdown

  ngAfterViewInit() {
    this.undoButton?.trigger.subscribe(()=>{
      console.log("Emitting undo!")
      this.undo.emit();
    })

    this.redoButton?.trigger.subscribe(()=>{
      console.log("Emitting redo!")
      this.redo.emit();
    })
  }

  // Listen for outside clicks and disable dropdown if detected
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedInside = this.dropdownRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.toggled = false;
    }
  }
}
