import inherits from 'inherits';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';

export default function PnRuleProvider(eventBus, elementRegistry) {
  this._elementRegistry = elementRegistry;
  RuleProvider.call(this, eventBus);
}

PnRuleProvider.$inject = [
  'eventBus', 
  'elementRegistry'
];

inherits(PnRuleProvider, RuleProvider);


// Todo: Add rule for elements.move and check for overlaps with other shapes
PnRuleProvider.prototype.init = function () {
  this.addRule('connection.create', function (context) {
    const { source, target } = context;
    return canConnect(source, target);
  });

  this.addRule('connection.start', function (context) {
    const source = context.source;
    return (
      source.type === 'pn:Place' || source.type === 'pn:Transition'
    ) && { type: 'pn:Arc' };
  });

  this.addRule('connection.reconnect', function (context) {
    const { source, target } = context;
    return canConnect(source, target);
  });

  this.addRule('connection.updateWaypoints', function (context) {
    return {
      type: context.connection.type
    };
  });

  this.addRule('shape.resize', function (context) {
    if (context.shape.type === 'pn:Transition') {
      return true;
    }
    return false;
  });
}

PnRuleProvider.prototype.canConnect = canConnect;

function canConnect(source, target) {
  return ((source.type === 'pn:Place' && target.type === 'pn:Transition')
    || (source.type === 'pn:Transition' && target.type === 'pn:Place')
  ) && { type: 'pn:Arc' };
}
