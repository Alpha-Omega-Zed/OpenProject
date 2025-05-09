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

@Component({
  selector: 'opce-editor-enhancer',
  standalone: true,
  imports: [
    WpEnhanceTextButtonComponent,
    OpenprojectFieldsModule
  ],
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class OpceEditorEnhancerComponent implements AfterViewInit {
  constructor(
    private host: ElementRef<HTMLElement>,
    private http: HttpClient,
    private aiModalAugment: WpAiSuggestionModalAugmentComponent,
  ) {}

  private editorComponent: EditableAttributeFieldComponent
  private buttonComponent: WpEnhanceTextButtonComponent

  ngAfterViewInit() {
    const hostEl = this.host.nativeElement;

    // Find the two child elements in the light DOM:
    const btnEl    = hostEl.querySelector('opce-enhance-text-button');
    const editorEl = hostEl.querySelector('op-editable-attribute-field');

    if (!btnEl || !editorEl) {
      console.error('Could not find button or editor inside <opce-editor-enhancer>');
      return;
    }

    // Grab the Angular component instances behind those elements:
    this.buttonComponent = (window as any).ng.getComponent(btnEl) as WpEnhanceTextButtonComponent;
    this.editorComponent = (window as any).ng.getComponent(editorEl) as EditableAttributeFieldComponent;

    console.log('button instance:', this.buttonComponent);
    console.log('editor instance:', this.editorComponent);

    // Subscribe to click
    this.buttonComponent.clicked.subscribe(() => this.enhanceDescription());
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
      .subscribe(r => {
        let options: string[];
        console.log(`Improved text: ${r.improvedText}`)
        try { options = JSON.parse(r.improvedText); }
        catch { options = [r.improvedText]; }
        this.aiModalAugment.spawnModal(options, (content: string)=>this.optionSelected(content));
      });
  }

  private getEditorComponent(editor: EditableAttributeFieldComponent): OpCkeditorComponent | undefined {
    const textElement = editor.editContainer.nativeElement.querySelector('op-ckeditor')
    const textComponent = (window as any).ng.getComponent(textElement) as OpCkeditorComponent
    return textComponent
  }

  private getContent(): string | undefined {
    return this.getEditorComponent(this.editorComponent)?.ckEditorInstance.getData({trim: false});
  }
  
  private optionSelected(selection: string): void {
    this.setContent(selection)
    this.buttonComponent.loading = false // Done loading
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
