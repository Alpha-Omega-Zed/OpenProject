import {
  ChangeDetectionStrategy,
  Component,
  AfterViewInit,
  ElementRef,
  ViewEncapsulation
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { WpAiSuggestionModalAugmentComponent } from '../wp-ai-suggestion-modal/wp-ai-suggestion-modal-augment.service';
import { WpEnhanceTextButtonComponent } from '../wp-buttons/wp-enhance-text-button/wp-enhance-text-button.component';
import { OpenprojectFieldsModule } from 'core-app/shared/components/fields/openproject-fields.module';
import { EditableAttributeFieldComponent } from 'core-app/shared/components/fields/edit/field/editable-attribute-field.component';
import { OpCkeditorComponent } from 'core-app/shared/components/editor/components/ckeditor/op-ckeditor.component';
import { WpEnhancementDropdownComponent } from '../wp-buttons/wp-enhancement-dropdown/wp-enhancement-dropdown.component';
import { WpEnhancementOptionButtonComponent } from '../wp-buttons/wp-enhnancement-option-button/wp-enhancement-option-button.component';
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
  standalone: true,
  imports: [
    WpEnhanceTextButtonComponent,
    WpEnhancementDropdownComponent,
    OpenprojectFieldsModule,
    WpEnhancementOptionButtonComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class OpceEditorEnhancerComponent implements AfterViewInit {
  constructor(
    private host: ElementRef<HTMLElement>,
    private http: HttpClient,
    private aiModalAugment: WpAiSuggestionModalAugmentComponent,
  ) {}

  private editorComponent   : EditableAttributeFieldComponent;
  private buttonComponent   : WpEnhanceTextButtonComponent;
  private dropdownComponent : WpEnhancementDropdownComponent;
  private history           :EditorSnapshot = new EditorSnapshot();

  ngAfterViewInit() {
    const hostEl = this.host.nativeElement;

    // Find the two child elements in the light DOM:
    const btnEl      = hostEl.querySelector('opce-enhance-button');
    const editorEl   = hostEl.querySelector('op-editable-attribute-field');
    const dropdownEl = hostEl.querySelector('opce-enhancement-dropdown') 

    if (!btnEl || !editorEl) {
      console.error('Could not find button or editor inside <opce-editor-enhancer>');
      return;
    }

    // Grab the Angular component instances behind those elements:
    this.buttonComponent = (window as any).ng.getComponent(btnEl) as WpEnhanceTextButtonComponent;
    this.editorComponent = (window as any).ng.getComponent(editorEl) as EditableAttributeFieldComponent;
    this.dropdownComponent = (window as any).ng.getComponent(dropdownEl) as WpEnhancementDropdownComponent;

    console.log('button instance:', this.buttonComponent);
    console.log('editor instance:', this.editorComponent);
    console.log('dropdown instance:', this.dropdownComponent);

    // Subscribe to click
    this.buttonComponent?.clicked.subscribe(() => this.enhanceDescription());
    this.dropdownComponent?.undo.subscribe(() => this.undoAction());
    this.dropdownComponent?.redo.subscribe(() => this.redoAction());
  }

  private enhanceDescription() {
    const raw  = this.getContent();

    if(!raw){
      console.log("No text found...")
      return; // No retrievable content, just ignore for now
    }
    
    const text = this.stripHtml(raw);

    console.log(`Text sent to 'ai': ${text}`)

    this.http.post<{improvedText: string}>('/ai_services/enhance', { text })
    .pipe(
      catchError((error)=>{
        console.error("Enhance request failed", error)
        this.buttonComponent.loading = false
        return of({ improvedText: null });
      })
    )
      .subscribe(r => {
        if(!r.improvedText){
          console.error("Failed to connect to ai microservice")
          this.buttonComponent.setLoading(false) // Done loading
          return
        }

        let options: string[];
        console.log(`Improved text: ${r.improvedText}`)
        try { options = JSON.parse(r.improvedText); }
        catch { options = [r.improvedText]; }
        this.aiModalAugment.spawnModal(options, (content: string)=>this.optionSelected(content));
      });
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

  private getEditorComponent(editor: EditableAttributeFieldComponent): OpCkeditorComponent | undefined {
    const textElement = editor.editContainer.nativeElement.querySelector('op-ckeditor')
    const textComponent = (window as any).ng.getComponent(textElement) as OpCkeditorComponent
    return textComponent
  }

  private getContent(): string | undefined {
    const raw = this.getEditorComponent(this.editorComponent)?.ckEditorInstance.getData({trim: false})

    // Replace escaped characters to ensure proper change detection
    let parser = new DOMParser();
    let decoded = raw?parser.parseFromString(raw, "text/html")?.body?.textContent : undefined;
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
    this.getEditorComponent(this.editorComponent)?.ckEditorInstance.setData(content)
  }

  private stripHtml(html: string) {
    const div = document.createElement('div');
    div.innerHTML = html;
    div.querySelectorAll('img').forEach(i => i.replaceWith(`[image:${i.alt}]`));
    return div.textContent!;
  }
}
