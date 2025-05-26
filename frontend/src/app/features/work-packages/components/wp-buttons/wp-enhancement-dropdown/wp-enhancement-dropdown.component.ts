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
  @Output() generateSubtasks = new EventEmitter<void>();
  @Output() undo = new EventEmitter<void>();
  @Output() redo = new EventEmitter<void>();
  @Output() toggleChanged = new EventEmitter<boolean>();
  @Output() translate = new EventEmitter<String>();

  @ViewChild("dropdown", { static: true }) dropdownRef!: ElementRef;
  @ViewChild("translator", { static: true }) translatorRef!: ElementRef;

  constructor(private cdr: ChangeDetectorRef) {}

  public toggled = false; // Toggles the dropdown

  public elementState: { [key: string]: boolean } = {}; // Holds state for some elements in the dropdown

  public setToggled(id: string, state: boolean) {
    if(this.elementState[`${id}.toggled`] != state){
      if(id == 'dropdown'){
        this.toggleChanged.emit(state);
        if(!state){
          // Reset all subelement states when closing the dropdown
          for (const key in this.elementState) {
            if (key.endsWith('.toggled')) {
              delete this.elementState[key];
            }
          }
        }
      }

      this.elementState = { ...this.elementState, [`${id}.toggled`]: state };
      this.cdr.markForCheck();
    }
  }

  public getToggled(id: string): boolean {
    return this.elementState[`${id}.toggled`]  || false;
  }

  public setLoading(id: string, state: boolean) {
    if(this.elementState[`${id}.loading`] != state){
      this.elementState = { ...this.elementState, [`${id}.loading`]: state };
      this.cdr.markForCheck();
    }
  }

  public onTranslate(event: MouseEvent, lang: string): void {
    event.stopPropagation();
    this.translate.emit(lang);
  }

  // Listen for outside clicks and disable dropdown if detected
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedInsideDropdown = this.dropdownRef?.nativeElement.contains(event.target);
    if (!clickedInsideDropdown) {
      this.setToggled('dropdown', false);
    }

    const clickedInsideTranslator = this.translatorRef?.nativeElement.contains(event.target);
    if (!clickedInsideTranslator) {
      this.setToggled('translator', false);
    }
  }
}
