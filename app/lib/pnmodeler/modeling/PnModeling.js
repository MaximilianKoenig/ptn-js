import BaseModeling from 'diagram-js/lib/features/modeling/Modeling';
import inherits from 'inherits';

export default function PnModeling(eventBus, elementFactory, commandStack) {
    BaseModeling.call(this, eventBus, elementFactory, commandStack);
}

inherits(PnModeling, BaseModeling);

PnModeling.$inject = [
    'eventBus',
    'elementFactory',
    'commandStack',
];

PnModeling.prototype.updateLabel = function (element, newLabel, newBounds, hints) {
    this._commandStack.execute('element.updateLabel', {
        element: element,
        newLabel: newLabel,
        newBounds: newBounds,
        hints: hints || {}
    });
};

PnModeling.prototype.getHandlers = function () {
  const handlers = BaseModeling.prototype.getHandlers.call(this);
  handlers['element.updateLabel'] = UpdateLabelHandler;
  return handlers;
}

function UpdateLabelHandler() {
}

UpdateLabelHandler.prototype.execute = function (context) {
  const { element, newLabel } = context;
  element.label = { text: newLabel };
  return element;
}
