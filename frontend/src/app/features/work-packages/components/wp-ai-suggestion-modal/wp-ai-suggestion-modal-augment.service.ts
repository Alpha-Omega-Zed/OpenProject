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
        console.log("User picked option "+instance.data)
        updateSelection(instance.data)
      }));
  }
}
