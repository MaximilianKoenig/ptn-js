import inherits from 'inherits';

import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';
import { isLabel } from '../modeling/LabelUtil';
import { is } from '../../util/Util';

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
      source.type === 'ptn:Place' || source.type === 'ptn:Transition'
    ) && { type: 'ptn:Arc' };
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

  // Shapes should not be placed on top of each other.
  // Look at https://github.com/bpmn-io/bpmn-js/blob/c3ab26b1ab8e33f238cec6c9704f875e4ddc1a1a/lib/features/rules/BpmnRules.js#L160 for reference
  // if your modeler should support overlapping/hierarchical shapes.
  // Note: Currently, the target is defined as the shape at the cursor position.
  // Hence, overlaps are still possible since we do consider the bounds of the moved shape.
  this.addRule('elements.move', function (context) {
    const { target, shapes } = context;
    return canMove(shapes, target);
  });

  this.addRule('shape.resize', function (context) {
    if (context.shape.type === 'ptn:Transition') {
      return true;
    }
    return false;
  });
}

PnRuleProvider.prototype.canConnect = canConnect;

function canConnect(source, target) {
  return ((source.type === 'ptn:Place' && target.type === 'ptn:Transition')
    || (source.type === 'ptn:Transition' && target.type === 'ptn:Place')
  ) && { type: 'ptn:Arc' };
}

function canMove(shapes, target) {
  // allow default move check to start move operation
  if (!target) {
    return true;
  }

  // check if shapes can be dropped on target location
  return shapes.every(function(shape) {
    return canDrop(shape, target);
  });
}

function canDrop(shape, target) {
  // labels can be moved everywhere
  if (isLabel(shape)) {
    return true;
  }

  // FlowNodes (i.e., places and transitions) cannot be dropped on other FlowElements (i.e., FlowNodes and arcs)
  if (is(shape, "ptn:PtnFlowNode")) {
    return !is(target, "ptn:PtnFlowElement");
  }

  return false;
}
