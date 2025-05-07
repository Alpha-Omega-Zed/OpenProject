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
    const btnCmp    = (window as any).ng.getComponent(btnEl) as WpEnhanceTextButtonComponent;
    const editorCmp = (window as any).ng.getComponent(editorEl) as EditableAttributeFieldComponent;

    console.log('button instance:', btnCmp);
    console.log('editor instance:', editorCmp);

    // Subscribe to click
    btnCmp.clicked.subscribe(() => this.enhanceDescription(editorCmp));
  }

  private enhanceDescription(editor: EditableAttributeFieldComponent) {
    const raw  = this.getContent(editor);

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
        this.aiModalAugment.spawnModal(options, this.setContent);
      });
  }

  private getContent(editor: EditableAttributeFieldComponent): string | null {
    // find the textarea id
    // console.log("native element: "+editor.editContainer.nativeElement)
    // const textarea = editor.editContainer.nativeElement.innerText
    return "Empty for now..."
  }
  
  private setContent(editor: EditableAttributeFieldComponent, content: string): void {
    // const textarea = editor.editContainer.nativeElement.querySelector('textarea');
    // const id = textarea?.id;
    // if(!id)return; // Do nothing if there's no id

    // const inst = (window as any).CKEDITOR?.instances[id];
    // if (inst) {
    //   inst.setData(content);
    // }
  }

  private stripHtml(html: string) {
    const div = document.createElement('div');
    div.innerHTML = html;
    div.querySelectorAll('img').forEach(i => i.replaceWith(`[image:${i.alt}]`));
    return div.textContent!;
  }
}
