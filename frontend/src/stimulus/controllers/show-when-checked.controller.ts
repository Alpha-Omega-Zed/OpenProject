import { ApplicationController } from 'stimulus-use';

export default class OpShowWhenCheckedController extends ApplicationController {
  static targets = ['cause', 'effect'];

  static values = {
    reversed: Boolean,
  };

  declare reversedValue:boolean;

  declare readonly hasReversedValue:boolean;

  declare readonly effectTargets:HTMLInputElement[];

  private boundListener = this.toggleDisabled.bind(this);

  causeTargetConnected(target:HTMLElement) {
    target.addEventListener('change', this.boundListener);
  }

  causeTargetDisconnected(target:HTMLElement) {
    target.removeEventListener('change', this.boundListener);
  }

  private toggleDisabled(evt:InputEvent):void {
    const checked = (evt.target as HTMLInputElement).checked;
    this.effectTargets.forEach((el) => {
      el.hidden = (this.hasReversedValue && this.reversedValue) ? checked : !checked;
    });
  }
}
