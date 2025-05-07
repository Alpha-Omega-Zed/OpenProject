import { Injectable, EventEmitter } from '@angular/core';
import { HalResource } from 'core-app/features/hal/resources/hal-resource';
import { CurrentProjectService } from 'core-app/core/current-project/current-project.service';
import { OpModalService } from 'core-app/shared/components/modal/modal.service';
import { WpAiSuggestionModalComponent } from './wp-ai-suggestion-modal.component';
import './ai-suggestion-modal.module';

@Injectable({
  providedIn: 'root'
})
export class WpAiSuggestionModalService {
  public close = new EventEmitter<HalResource|HalResource[]>();

  constructor(
    protected opModalService:OpModalService,
    protected currentProjectService:CurrentProjectService,
  ) {
  }

  public open(options:string[]|null) {
    this.opModalService.show(
        WpAiSuggestionModalComponent,
      'global',
      { options },
    ).subscribe((modal) => modal
      .closingEvent
      .subscribe((modal:WpAiSuggestionModalComponent) => {
        this.close.emit(modal.data);
      }));
  }
}
