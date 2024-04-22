import RulesModule from 'diagram-js/lib/features/rules';

import PnRuleProvider from './PnRuleProvider';

export default {
  __depends__: [
    RulesModule
  ],
  __init__: [ 'pnRuleProvider' ],
  pnRuleProvider: [ 'type', PnRuleProvider ]
};
