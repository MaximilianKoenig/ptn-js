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

PnRuleProvider.prototype.init = function () {
  this.addRule('connection.create', function (context) {
    const {source, target} = context;
    return ((source.type === 'pn:Place' && target.type === 'pn:Transition')
      || (source.type === 'pn:Transition' && target.type === 'pn:Place')
    ) && { type: 'pn:Arc' };
  });

  this.addRule('connection.start', function (context) {
    const source = context.source;
    return (
      source.type === 'pn:Place' || source.type === 'pn:Transition'
    ) && { type: 'pn:Arc' };
  });
}
