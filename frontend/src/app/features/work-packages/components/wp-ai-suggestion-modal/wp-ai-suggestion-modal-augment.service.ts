import { Injectable, ElementRef } from '@angular/core';
import { OpModalService } from 'core-app/shared/components/modal/modal.service';
import { CurrentProjectService } from 'core-app/core/current-project/current-project.service';
import { WpAiSuggestionModalComponent } from './wp-ai-suggestion-modal.component'

@Injectable({ providedIn: 'root' })
export class WpAiSuggestionModalAugmentComponent {
  constructor(
    protected opModalService:OpModalService,
    protected currentProjectService:CurrentProjectService,
  ) { }

  public spawnModal(opts:string[]|null, updateSelection:any) {
    this.opModalService.show(
        WpAiSuggestionModalComponent,
      'global',
      { options: opts },
    ).subscribe((modal) => modal
      .closingEvent
      .subscribe((instance:WpAiSuggestionModalComponent) => {
        // Just reload the page for now if we saved anything
        // if (instance.data) {
        //   window.location.reload();
        // }

        console.log("User picked option "+instance.data)

        if(instance.data){
          updateSelection(instance.data)
        }
      }));
  }

  // TODO: Injects content in the editor
  private setContent(editor:any, content: string) {
    console.log(`E: ${editor}, E1: ${editor?.editField}, E2: ${editor?.editField?.writeValue}`)
    // if (editor?.editField?.writeValue) {
    //   editor.editField.writeValue(`<p class="op-uc-p">${content}</p>`);
    // } else {
    //   console.warn('Editor writeValue method not available');
    // }
  }
}
