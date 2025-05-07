import { OnInit, Component, Input, Output, EventEmitter, ElementRef, ChangeDetectorRef, Inject } from '@angular/core';

import { OpModalLocalsMap } from 'core-app/shared/components/modal/modal.types';
import { OpModalLocalsToken } from 'core-app/shared/components/modal/modal.service';
import { OpModalComponent } from 'core-app/shared/components/modal/modal.component';
import { ApiV3Service } from 'core-app/core/apiv3/api-v3.service';

/* TODO: Find a way to fit this better:
** 1) Separate the logic of the button with that of the service,
**     it's probably best if the button doesn't involve any of the ai logic
** 2) Find a way to smoothly introduce the modal window, maybe take a look at
**     other usages throughout the project & API documentation.
** 3) You better mock the AI request, to boost testing speed and avoid charges
*/  

@Component({
  selector: 'opce-ai-suggestion-modal',
  templateUrl: './wp-ai-suggestion-modal.component.html',
  styleUrls: ['./wp-ai-suggestion-modal.component.sass']
})
export class WpAiSuggestionModalComponent extends OpModalComponent implements OnInit {
  @Output() public suggestionSelected = new EventEmitter<string>();
  @Output() public closeModalEvent = new EventEmitter<void>();

  /* Data that is returned from the modal on close */
  public data:any = null;
  public loading: boolean = false;
  public modalTitle:string = 'Enhanced description suggestions';
  public suggestions:string[] = []

  constructor(
    @Inject(OpModalLocalsToken) public locals:OpModalLocalsMap,
    readonly cdRef:ChangeDetectorRef,
    readonly elementRef:ElementRef,
    readonly apiV3Service:ApiV3Service,
  ) {
    super(locals, cdRef, elementRef);
  }

  ngOnInit(): void {
    this.suggestions = this.locals.options || [];
    this.cdRef.detectChanges();
  }

  public selectSuggestion(suggestion: string): void {
    this.data = suggestion;
    this.suggestionSelected.emit();
    this.closeModal();
  }

  public closeModal(): void {
    this.closeModalEvent.emit()
    this.closeMe();
  }
}