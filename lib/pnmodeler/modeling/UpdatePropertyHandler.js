export default function UpdatePropertyHandler(eventBus) {
  function execute(context) {
    const { element, propertyName, newValue } = context;
    const hints = context.hints || {};

    // Store old value for revert
    context.oldValue = element.businessObject[propertyName];

    element.businessObject[propertyName] = newValue;

    if (hints.rerender) {
      eventBus.fire('element.changed', { element })
    }
  }

  function revert(context) {
    const { element, propertyName, oldValue } = context;
    const hints = context.hints || {};

    element.businessObject[propertyName] = oldValue;

    if (hints.rerender) {
      eventBus.fire('element.changed', { element })
    }
  }

  this.execute = execute;
  this.revert = revert;
}
