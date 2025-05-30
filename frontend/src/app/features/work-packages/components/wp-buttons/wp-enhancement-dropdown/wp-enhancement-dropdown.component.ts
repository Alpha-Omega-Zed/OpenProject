import { 
  ChangeDetectionStrategy, 
  Component, 
  EventEmitter,
  Output, 
  ViewChild,
  ElementRef,
  HostListener,
  ChangeDetectorRef,
  ComponentRef,
} from '@angular/core';
import { Overlay, OverlayRef, OverlayPositionBuilder } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { CommonModule } from '@angular/common';
import { WpEnhancementDropdownOptionsComponent } from './dropdown/wp-enhancement-dropdown-options.component';

@Component({
  selector: 'opce-enhancement-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wp-enhancement-dropdown.component.html',
  styleUrls: ['./wp-enhancement-dropdown.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WpEnhancementDropdownComponent {
  @Output() generateSubtasks = new EventEmitter<void>();
  @Output() undo = new EventEmitter<void>();
  @Output() redo = new EventEmitter<void>();
  @Output() toggleChanged = new EventEmitter<boolean>();
  @Output() translate = new EventEmitter<String>();

  @ViewChild("dropdown", { static: true }) dropdownRef!: ElementRef;

  constructor(
    private cdr: ChangeDetectorRef, 
    private overlay: Overlay, 
  ) {}

  private overlayRef: OverlayRef;
  private overlayComponentRef: ComponentRef<WpEnhancementDropdownOptionsComponent> | null = null;
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
      this.setVisibility(state);
    }
  }

  public setVisibility(state: boolean) {
    if(state){
      console.log("dropdown ref: ", this.dropdownRef);
      const positionStrategy = this.overlay.position()
      .flexibleConnectedTo(this.dropdownRef.nativeElement)
      .withFlexibleDimensions(false)
      .withPositions([{
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
      }])


      if (this.overlayRef && this.overlayRef.hasAttached()) {
        this.overlayRef.detach();
      }
      
      this.overlayRef = this.overlay.create({ positionStrategy });
      const dropdownPortal = new ComponentPortal(WpEnhancementDropdownOptionsComponent);
      console.log("Just created a new ComponentPortal for WpEnhancementDropdownOptionsComponent");
      this.overlayComponentRef = this.overlayRef.attach(dropdownPortal);

      this.overlayComponentRef.instance.onUndoCb = ()=> {
        console.log("ok!!!");
        this.undo.emit()
      }
      this.overlayComponentRef.instance.onRedoCb = ()=> {
        this.redo.emit();
      }
      this.overlayComponentRef.instance.onTranslateCb = (lang: string)=> {
        this.setToggled("dropdown", false); // Close the dropdown after translation
        this.translate.emit(lang);
      }

      this.overlayComponentRef.changeDetectorRef.detectChanges();

      console.log('Callbacks set:', {
        onUndoCb: this.overlayComponentRef.instance.onUndoCb,
        onRedoCb: this.overlayComponentRef.instance.onRedoCb,
        onTranslateCb: this.overlayComponentRef.instance.onTranslateCb,
      });

      console.log("Dropdown opened");
    }else{
      if(this.overlayRef){
        this.overlayComponentRef?.destroy();
        this.overlayComponentRef = null;
        this.overlayRef.detach();
        this.overlayRef.dispose();
      }
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

  // Listen for outside clicks and disable dropdown if detected
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedInsideDropdown = 
      this.dropdownRef?.nativeElement.contains(event.target) || 
      this.overlayComponentRef?.location?.nativeElement.contains(event.target);
      
    if (!clickedInsideDropdown) {
      this.setToggled('dropdown', false);
    }

    // const clickedInsideTranslator = this.translatorRef?.nativeElement.contains(event.target);
    // if (!clickedInsideTranslator) {
    //   this.setToggled('translator', false);
    // }
  }
}
