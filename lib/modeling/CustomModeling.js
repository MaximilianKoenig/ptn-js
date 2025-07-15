import BaseModeling from 'diagram-js/lib/features/modeling/Modeling';
import UpdateLabelHandler from './UpdateLabelHandler';
import UpdatePropertyHandler from './UpdatePropertyHandler';

export default class CustomModeling extends BaseModeling {
  constructor(eventBus, elementFactory, commandStack) {
    super(eventBus, elementFactory, commandStack);
  }

  updateLabel(element, newLabel, newBounds, hints) {
    this._commandStack.execute('element.updateLabel', {
      element: element,
      newLabel: newLabel,
      newBounds: newBounds,
      hints: hints || {}
    });
  }

  updateProperty(element, propertyName, newValue, hints) {
    this._commandStack.execute('element.updateProperty', {
      element: element,
      propertyName: propertyName,
      newValue: newValue,
      hints: hints || {}
    });
  }

  getHandlers() {
    const handlers = super.getHandlers.call(this);
    handlers['element.updateLabel'] = UpdateLabelHandler;
    handlers['element.updateProperty'] = UpdatePropertyHandler;
    return handlers;
  }
}

CustomModeling.$inject = [
  'eventBus',
  'elementFactory',
  'commandStack',
];
