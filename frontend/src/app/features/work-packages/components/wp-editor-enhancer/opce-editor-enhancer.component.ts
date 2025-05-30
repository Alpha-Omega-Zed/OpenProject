import {
  ChangeDetectionStrategy,
  Component,
  AfterViewInit,
  ElementRef,
  ViewEncapsulation,
  Input,
  EventEmitter,
  ChangeDetectorRef,
  ViewChild,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WpAiSuggestionModalAugmentComponent } from '../wp-ai-suggestion-modal/wp-ai-suggestion-modal-augment.service';
import { WpEnhanceTextButtonComponent } from '../wp-buttons/wp-enhance-text-button/wp-enhance-text-button.component';
import { OpCkeditorComponent } from 'core-app/shared/components/editor/components/ckeditor/op-ckeditor.component';
import { WpEnhancementDropdownComponent } from '../wp-buttons/wp-enhancement-dropdown/wp-enhancement-dropdown.component';
import { of, catchError } from 'rxjs';

export class EditorSnapshot {
  private history: string[] = [];
  private index: number = -1;

  public append(state: string){
    if(state!=this.history[this.index]){
      this.history = this.history.slice(0, ++this.index);
      this.history.push(state);
    }
  }

  public getAll(): string[]{
    return this.history;
  }

  public take(): string|undefined{
    if(this.hasHistory()){
      return this.history[--this.index];
    }

    return undefined;
  }

  public next(): string|undefined{
    if(this.hasFuture()){
      return this.history[++this.index];
    }

    return undefined;
  }

  public hasHistory(): boolean{
    return this.index>0 && this.history.length>0;
  }

  public hasFuture(): boolean{
    return this.history.length>this.index+1 && this.history.length>0;
  }

  public isEmpty(): boolean{
    return this.history.length == 0;
  }
}

@Component({
  selector: 'opce-editor-enhancer',
  templateUrl: './opce-editor-enhancer.component.html',
  styleUrls: ['./opce-editor-enhancer.component.sass'],
  standalone: true,
  imports: [
    WpEnhanceTextButtonComponent,
    WpEnhancementDropdownComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class OpceEditorEnhancerComponent implements AfterViewInit {
  constructor(
    private host: ElementRef<HTMLElement>,
    private http: HttpClient,
    private aiModalAugment: WpAiSuggestionModalAugmentComponent,
    private cdRef: ChangeDetectorRef,
  ) {}

  @ViewChild('editor', { static: true }) editorContainer!: ElementRef<HTMLElement>;

  private editorElement     : HTMLElement | null = null;
  private buttonComponent   : WpEnhanceTextButtonComponent;
  private dropdownComponent : WpEnhancementDropdownComponent;
  private history           : EditorSnapshot = new EditorSnapshot();

  public inline: boolean = false; // Whether this editor enhancer is used inline or not
  public isTextInputField: boolean = false; // Whether this is a text input field or something else (e.g. dropdown)
  public forceAIGizmo: boolean = false; // Whether the AI gizmo should be forced to be shown
  public inFocus: boolean = false; // Whether the editor is focused or not

  public _onFocusLossEvent?: EventEmitter<string>;
  public _onFocusEvent?: EventEmitter<string>;

  @Input() set onFocusEvent(event: EventEmitter<string> | undefined) {
    if(event && !this._onFocusEvent){
      this._onFocusEvent = event;
      this._onFocusEvent.subscribe(()=>{
          this.initComponents();
          this.onFocusChange(); // Re-check focus state
        }
      );
    }
  }

  @Input() set onFocusLossEvent(event: EventEmitter<string> | undefined) {
    if(event && !this._onFocusLossEvent){
      this._onFocusLossEvent = event;
      this._onFocusLossEvent.subscribe(()=>{
          this.onFocusChange(); // Re-check focus state
        }
      );
    }
  }

  ngAfterViewInit(): void {
    this.initComponents(); // Initialize components if not already done
  }

  private initComponents() {
    if(this.buttonComponent && this.dropdownComponent && this.editorElement){
      // All components already available, don't look for them again
      return;
    }

    console.log("HTML structure: ", this.host.nativeElement.innerHTML);

    const hostEl        = this.editorContainer.nativeElement; 
    const btnEl         = hostEl.querySelector('opce-enhance-button');
    const dropdownEl    = hostEl.querySelector('opce-enhancement-dropdown'); 
    this.editorElement  = hostEl.querySelector('op-ckeditor');

    console.log("Button element:", btnEl);
    console.log("Dropdown element:", dropdownEl);
    console.log("Editor element:", this.editorElement);

    if (!btnEl || !this.editorElement) {
      console.error('Could not find button or editor inside <opce-editor-enhancer>');
      return;
    }

    // Instances behind those elements
    this.buttonComponent = (window as any).ng.getComponent(btnEl) as WpEnhanceTextButtonComponent;
    this.dropdownComponent = (window as any).ng.getComponent(dropdownEl) as WpEnhancementDropdownComponent;

    console.log('button instance:', this.buttonComponent);
    console.log('dropdown instance:', this.dropdownComponent);
    console.log('editor html element:', this.editorElement);

    // Subscribe to click events
    this.buttonComponent?.clicked.subscribe(() => this.enhanceDescription());
    this.dropdownComponent?.undo.subscribe(() => this.undoAction());
    this.dropdownComponent?.redo.subscribe(() => this.redoAction());
    this.dropdownComponent?.translate.subscribe((lang: string) => this.translateDescription(lang));
  }

  private makeAIRequest(
    url: string, returnField: string, cb: CallableFunction, 
    errorCb: CallableFunction, loadingDone: CallableFunction, lang:string = ''
  ) {
    const raw  = this.getContent();

    if(!raw){
      console.log("No text found...")
      loadingDone();
      return; // No retrievable content, just ignore for now
    }

    const text = this.stripHtml(raw);

    console.log(`Text sent to '${url}': ${text}`)

    this.http.post<Record<string, string | null>>(url, {text, lang})
      .pipe(
        catchError((error) => {
          errorCb(error);
          return of({ [returnField]: null }); // Explicit fallback of correct type
      })
      )
      .subscribe(r => {
        if(!r[returnField]){
          console.error(`Failed to connect to ai microservice '${url}`);
          loadingDone(); // Done loading
          return
        }
        cb(r[returnField]);
      });
  }

  private enhanceDescription() {
    this.makeAIRequest(
      '/ai_services/enhance',
      'improvedText',
      (result: string) => {
        let options: string[];
        console.log(`Improved text: ${result}`)
        try { options = JSON.parse(result); }
        catch { options = [result]; }
        this.aiModalAugment.spawnModal(options, (content: string)=>this.optionSelected(content));
      },
      (error: any) => {
        console.error("Enhance request failed", error);
        this.buttonComponent.setLoading(false); // Done loading
      },
      () => this.buttonComponent.setLoading(false) // Done loading
    )
  }

  private translateDescription(language: string) {
    this.makeAIRequest(
      '/ai_services/translate', 
      'translatedText',
      (result:string, content: string) => {;
        let options: string[];
        console.log(`Improved text: ${result}`)
        try { options = JSON.parse(result); }
        catch { options = [result]; }
        this.aiModalAugment.spawnModal(options, (content: string)=>this.optionSelected(content));  
      },
      (error: any) => {
        console.error("Translation request failed", error);
        this.dropdownComponent.setLoading('translator', false); // Done loading translation
      },
      () => this.dropdownComponent.setLoading('translator', false) // Done loading translation
      ,language // The target language
    );
  }

  private undoAction(){
    const raw  = this.getContent();

    const state = this.history.take();
    console.log("Undoing, new text: "+state);
    if(state){
      this.setContent(state);
    }
  }

  private redoAction(){
    const state = this.history.next();
    console.log("Redoing, new text: "+state)
    if(state){
      this.setContent(state);
    }
  }

  public onFocusChange(){
    // Defer to ensure document.activeElement is up-to-date
    setTimeout(() => {
      console.log("Focus changed!")
      const inFocus = this.host.nativeElement.contains(document.activeElement);

      if(inFocus!=this.inFocus){
        console.log(`Focus updated: [${inFocus}]`)
        this.inFocus = inFocus;
        this.inline = this.isInline(); // Trigger update

        // Explicitly trigger change detection
        this.cdRef.detectChanges();
      }
    });
  }

  public onAiGizmoToggle(state: any): void {
    console.log(`From A.F.: Dropdown toggled: ${state.detail}`);
    this.forceAIGizmo = state.detail;
  }

  private isInline(): boolean {
    return !this.getEditorComponent();
  }

  private getEditorComponent(): OpCkeditorComponent | undefined {
    if(!this.editorElement)
      return undefined;

    return (window as any).ng.getComponent(this.editorElement) as OpCkeditorComponent;
  }

  private getPlainText(): string | undefined {
    const el = this.editorElement?.querySelector('input, textarea, [contenteditable="true"]') || undefined;

    if(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement){
      return el.value
    } else {
      return el?.textContent?.trim()
    }
  }

  private setPlainText(text: string):void {
    const el = this.editorElement?.querySelector('input, textarea, [contenteditable="true"]') || undefined;

    if(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement){
      el.value = text;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      el && (el.textContent = text);
      el && el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  private getContent(): string | undefined {
    const raw = this.getEditorComponent()?.ckEditorInstance?.getData({trim: false})

    // Replace escaped characters to ensure proper change detection
    let parser = new DOMParser();
    let decoded = raw?parser.parseFromString(raw, "text/html")?.body?.textContent : this.getPlainText();

    return decoded || undefined;
  }
  
  private optionSelected(selection: string | null): void {
    if(selection){
      const raw  = this.getContent();
      if(raw){
        this.history.append(raw); // Record history before modification if 
        console.log("History is now: "+this.history.getAll())
      }
      this.setContent(selection)

      this.history.append(selection);
    }
    this.buttonComponent.setLoading(false) // Done loading
  }

  private setContent(content: string): void {
    const ckEditorInstance = this.getEditorComponent()?.ckEditorInstance;
    if(ckEditorInstance)
      ckEditorInstance.setData(content);
    else 
      this.setPlainText(content);
  }

  private stripHtml(html: string) {
    const div = document.createElement('div');
    div.innerHTML = html;
    div.querySelectorAll('img').forEach(i => i.replaceWith(`[image:${i.alt}]`));
    return div.textContent!;
  }
}
