import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WpAiSuggestionModalAugmentComponent } from './wp-ai-suggestion-modal-augment.service';
import { WpAiSuggestionModalComponent } from './wp-ai-suggestion-modal.component';

@NgModule({
  imports: [CommonModule],
  declarations: [WpAiSuggestionModalComponent],
  providers: [WpAiSuggestionModalAugmentComponent],
})
export class WpAiSuggestionModalModule {}
