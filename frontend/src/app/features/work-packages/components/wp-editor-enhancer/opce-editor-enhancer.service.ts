import { 
    ApplicationRef, 
    Inject, 
    Injectable, 
    EmbeddedViewRef,
    createComponent,
} from '@angular/core';
import { OpceEditorEnhancerComponent } from './opce-editor-enhancer.component';
import { DOCUMENT } from '@angular/common';
import { OpCkeditorComponent } from 'core-app/shared/components/editor/components/ckeditor/op-ckeditor.component';

/**
 * This service is used to wrap the ckeditor component with the editor enhancer component.
 */
@Injectable({ providedIn: 'root' })
export class OpEditorEnhancerService {
  constructor(
    @Inject(DOCUMENT) protected documentElement:Document,
    private appRef: ApplicationRef,
  ) { }

  /**
   * Wrap ckeditor with the editor enhancer component
   */
  public wrapEditor(el: Element) {
        console.log("Wrapping editor with enhancer component ", el);

        const ckeditorObj = (window as any).ng.getComponent(el) as OpCkeditorComponent;

        if(ckeditorObj){
            const editorRef = createComponent(OpceEditorEnhancerComponent, {
                environmentInjector: this.appRef.injector,
            });
            editorRef.instance.onFocusEvent = ckeditorObj.editorFocus;
            editorRef.instance.onFocusLossEvent = ckeditorObj.editorBlur;
            editorRef.instance.isTextInputField = true;

            
            const editorDomElem = editorRef.instance.editorContainer.nativeElement;
            el.parentNode?.insertBefore(editorDomElem, el);
            editorDomElem.appendChild(el);
        }
    }
}
