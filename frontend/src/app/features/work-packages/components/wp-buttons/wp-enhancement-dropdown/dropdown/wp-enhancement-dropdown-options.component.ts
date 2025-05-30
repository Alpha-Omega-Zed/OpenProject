import { 
  ChangeDetectionStrategy, 
  Component, 
  EventEmitter,
  Output, 
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  Input,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'opce-enhancement-dropdown-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './wp-enhancement-dropdown-options.component.html',
  styleUrl: './wp-enhancement-dropdown-options.component.sass',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WpEnhancementDropdownOptionsComponent {
  @ViewChild("translator", { static: true }) translatorRef!: ElementRef;

  constructor(
    private cdr: ChangeDetectorRef, 
  ) {}

  private _onUndoCb: CallableFunction;
  @Input()
  set onUndoCb(cb: CallableFunction) {
    this._onUndoCb = cb;
    console.log('onUndoCb set:', cb);
  }
  get onUndoCb() {
    return this._onUndoCb;
  }

  private _onRedoCb: CallableFunction;
  @Input()
  set onRedoCb(cb: CallableFunction) {
    this._onRedoCb = cb;
    console.log('onRedoCb set:', cb);
  }
  get onRedoCb() {
    return this._onRedoCb;
  }

  private _onTranslateCb: CallableFunction;
  @Input()
  set onTranslateCb(cb: CallableFunction) {
    this._onTranslateCb = cb;
    console.log('onTranslateCb set:', cb);
  }
  get onTranslateCb() {
    return this._onTranslateCb;
  }

  public toggled = false; // Toggles the dropdown

  public elementState: { [key: string]: boolean } = {}; // Holds state for some elements in the dropdown

  public setToggled(id: string, state: boolean) {
    if(this.elementState[`${id}.toggled`] != state){
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

  public onUndo(): void {
    console.log("overlay undo called, cb is: ", this.onUndoCb);
    this.onUndoCb?.();
  }
  
  public onRedo(): void {
    this.onRedoCb?.();
  }

  public onTranslate(event: MouseEvent, lang: string): void {
    event.stopPropagation();
    this.onTranslateCb?.(lang);
  }

  // Listen for outside clicks and disable dropdown if detected
  @HostListener('document:click', ['$event'])
  handleClickOutside(event: MouseEvent) {
    const clickedInsideTranslator = this.translatorRef?.nativeElement.contains(event.target);
    if (!clickedInsideTranslator) {
      this.setToggled('translator', false);
    }
  }
}
