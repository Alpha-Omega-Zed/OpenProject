//-- copyright
// OpenProject is an open source project management software.
// Copyright (C) the OpenProject GmbH
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License version 3.
//
// OpenProject is a fork of ChiliProject, which is a fork of Redmine. The copyright follows:
// Copyright (C) 2006-2013 Jean-Philippe Lang
// Copyright (C) 2010-2013 the ChiliProject Team
//
// This program is free software; you can redistribute it and/or
// modify it under the terms of the GNU General Public License
// as published by the Free Software Foundation; either version 2
// of the License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
//
// See COPYRIGHT and LICENSE files for more details.
//++

import {
  HalResourceEditingService,
} from 'core-app/shared/components/fields/edit/services/hal-resource-editing.service';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  ViewChild,
  EventEmitter,
} from '@angular/core';
import { OPContextMenuService } from 'core-app/shared/components/op-context-menu/op-context-menu.service';
import { I18nService } from 'core-app/core/i18n/i18n.service';
import { getPosition } from 'core-app/shared/helpers/set-click-position/set-click-position';
import { EditFormComponent } from 'core-app/shared/components/fields/edit/edit-form/edit-form.component';
import { HalResource } from 'core-app/features/hal/resources/hal-resource';
import { UntilDestroyedMixin } from 'core-app/shared/helpers/angular/until-destroyed.mixin';
import { SchemaCacheService } from 'core-app/core/schemas/schema-cache.service';
import {
  displayClassName,
  DisplayFieldRenderer, displayTriggerLink,
  editFieldContainerClass,
} from 'core-app/shared/components/fields/display/display-field-renderer';
import { States } from 'core-app/core/states/states.service';
import { debugLog } from '../../../../helpers/debug_output';
import { hasSelectionWithin } from '../../../../helpers/selection-helpers';
import { EditFieldHandler } from 'core-app/shared/components/fields/edit/editing-portal/edit-field-handler';
import { SchemaResource } from 'core-app/features/hal/resources/schema-resource';

@Component({
  selector: 'op-editable-attribute-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './editable-attribute-field.component.html',
  styleUrls: ['./editable-attribute-field.component.sass'],
})
export class EditableAttributeFieldComponent extends UntilDestroyedMixin implements OnInit, OnDestroy {
  @Input() public fieldName:string;

  @Input() public resource:HalResource;

  @Input() public wrapperClasses?:string;

  @Input() public displayFieldOptions:{ [key:string]:unknown } = {};

  @Input() public isDropTarget?:boolean = false;

  @ViewChild('displayContainer', { static: true }) readonly displayContainer:ElementRef<HTMLElement>;

  @ViewChild('editContainer', { static: true }) readonly editContainer:ElementRef<HTMLElement>;

  public fieldRenderer:DisplayFieldRenderer;

  public editFieldContainerClass = editFieldContainerClass;

  public active = false;

  private $element:JQuery;

  public inline               = false; // For the editor enhancer
  public forceAIGizmo:boolean = false  // 
  public inFocus              = false; //

  public focused:EventEmitter<void>;

  public destroyed = false;

  constructor(
    protected states:States,
    protected injector:Injector,
    protected elementRef:ElementRef,
    protected opContextMenu:OPContextMenuService,
    protected halEditing:HalResourceEditingService,
    protected schemaCache:SchemaCacheService,
    // Get parent field group from injector if we're in a form
    @Optional() protected editForm:EditFormComponent,
    protected cdRef:ChangeDetectorRef,
    protected I18n:I18nService,
  ) {
    super();
  }

  public setActive(active = true):void {
    this.active = active;
    if (!this.componentDestroyed) {
      this.cdRef.detectChanges();
    }
  }

  public ngOnInit():void {
    this.focused = new EventEmitter<void>();
    this.cdRef.detectChanges();
    
    this.fieldRenderer = new DisplayFieldRenderer(this.injector, 'single-view', this.displayFieldOptions);
    this.$element = jQuery<HTMLElement>(this.elementRef.nativeElement);

    // Register on the form if we're in an editable context
    this.editForm?.register(this);

    this.halEditing
      .temporaryEditResource(this.resource)
      .values$()
      .pipe(
        this.untilDestroyed(),
      )
      .subscribe((resource) => {
        this.resource = resource;
        this.render();
      });
  }

  private logActiveElementDetails() {
    const el = document.activeElement;
    if (!el) {
      console.log('No active element');
      return;
    }
  
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const classes = el.classList.length > 0 ? '.' + Array.from(el.classList).join('.') : '';
    const text = (el.textContent || '').trim().slice(0, 30).replace(/\s+/g, ' ');
    const attrs = Array.from(el.attributes)
      .map(attr => `${attr.name}="${attr.value}"`)
      .join(' ');
  
    console.log(`Focused Element: <${tag}${id}${classes}>`);
    console.log(`Attributes: ${attrs}`);
    if (text) console.log(`Text content (trimmed): "${text}"`);
    console.log('Full element:', el);
  }
  
  

  public onFocusChange(){
    // Defer to ensure document.activeElement is up-to-date
    setTimeout(() => {
      console.log("Focus changed!")
      const inFocus = this.elementRef.nativeElement.contains(document.activeElement);
      console.log(`focused?: ${inFocus}`)
      this.logActiveElementDetails();

      if(inFocus!=this.inFocus){
        if(inFocus){
          console.log("Firing focused event!")
          this.focused.emit(); // Notify editor enhancer that we are focused
        }
        console.log(`Focus updated: [${inFocus}]`)
        this.inFocus = inFocus;
        this.inline = this.isContainerInline(); // Trigger update

        // Explicitly trigger change detection
        this.cdRef.detectChanges();
      }
    });
  }

  public onAiGizmoToggle(state: any): void {
    console.log(`From A.F.: Dropdown toggled: ${state.detail}`);
    this.forceAIGizmo = state.detail;
  }

  // If the container is an inline editor it won't contain a ck-editor element
  private isContainerInline():boolean {
    const inl = this.editContainer.nativeElement.querySelector('op-ckeditor') == null;
    return inl;
  }

  // Open the field when its closed and relay drag & drop events to it.
  public startDragActivation(event:DragEvent):void {
    if (!this.isDropTarget || !this.isEditable || this.active) {
      return;
    }

    this.handleUserActivate(null);
    event.preventDefault();
  }

  public render():void {
    const el = this.fieldRenderer.render(this.resource, this.fieldName, null);
    this.displayContainer.nativeElement.innerHTML = '';
    this.displayContainer.nativeElement.appendChild(el);
  }

  public deactivate(focus = false):void {
    this.editContainer.nativeElement.innerHTML = '';
    this.editContainer.nativeElement.hidden = true;
    this.setActive(false);

    if (focus) {
      setTimeout(() => this.$element.find(`.${displayClassName}`).focus(), 20);
    }
  }

  public get isEditable():boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    return !!(this.editForm && this.schema.isAttributeEditable(this.fieldName));
  }
  
  public get isTextInputField(): boolean {
    if (!this.editForm || !this.schema.isAttributeEditable(this.fieldName)) {
      return false;
    }
  
    const schemaField = this.schema[this.fieldName];
    const textTypes = ['String', 'Text', 'Formattable']; // Add others as needed
  
    return textTypes.includes(schemaField?.type || '');
  }
  

  public activateIfEditable(event:MouseEvent|KeyboardEvent):boolean {
    // Ignore selections
    if (hasSelectionWithin(event.target as HTMLElement)) {
      debugLog(`Not activating ${this.fieldName} because of active selection within`);
      return true;
    }

    // Skip activation if the user clicked on a link or within a macro
    const target = jQuery(event.target as HTMLElement);
    if (target.closest(`a:not(.${displayTriggerLink}),macro`, this.displayContainer.nativeElement).length > 0) {
      return true;
    }

    this.handleUserActivate(event);

    this.opContextMenu.close();
    event.preventDefault();
    event.stopImmediatePropagation();

    return false;
  }

  public activateOnForm(noWarnings = false):Promise<void|EditFieldHandler> {
    if (!this.isEditable) {
      return Promise.reject();
    }

    // Activate the field
    this.setActive(true);

    return this.editForm
      .activate(this.fieldName, noWarnings)
      .catch(() => this.deactivate(true));
  }

  public handleUserActivate(evt:MouseEvent|KeyboardEvent|null):boolean {
    if (!this.isEditable) {
      return false;
    }

    let positionOffset = 0;

    // This can be both a direct click as well as a "click" via keyboard, e.g. the <Enter> key.
    if (evt?.type === 'click') {
      // Get the position where the user clicked.
      positionOffset = getPosition(evt);
    }

    void this.activateOnForm()
      .then((handler) => {
        if (!handler) {
          return;
        }

        handler.$onUserActivate.next();
        handler.focus(positionOffset);
      });

    return false;
  }

  public reset():void {
    this.render();
    this.deactivate();
  }

  private get schema() {
    if (this.halEditing.typedState(this.resource).hasValue()) {
      const val = this.halEditing.typedState(this.resource).value as { schema:SchemaResource };
      return val.schema;
    }

    return this.schemaCache.of(this.resource);
  }
}
