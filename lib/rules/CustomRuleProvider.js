import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';
import { isLabel } from '../modeling/LabelUtil';
import { is } from '../util/Util';
import { MODELER_PREFIX } from '../util/constants';

export default class CustomRuleProvider extends RuleProvider {
  constructor(eventBus, elementRegistry) {
    super(eventBus);
    this._elementRegistry = elementRegistry;
  }

  // CustomModelerTodo: Define the rules for your modeler. For example, you can define which elements can be connected to each other,
  // which elements can be moved, resized, or created, and so on.
  init() {
    this.addRule('connection.create', function (context) {
      const { source, target } = context;
      return canConnect(source, target);
    });

    // CustomModelerTodo: Define which elements may be the source of a connection.
    // Returns the type of connection to be used. May depend on the source element type.
    this.addRule('connection.start', function (context) {
      const source = context.source;
      return is(source, `${MODELER_PREFIX}:Node`) && { type: `${MODELER_PREFIX}:Arc` };
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

    // Shapes should not be placed (created/moved) on top of each other.
    // Look at https://github.com/bpmn-io/bpmn-js/blob/c3ab26b1ab8e33f238cec6c9704f875e4ddc1a1a/lib/features/rules/BpmnRules.js#L160 for reference
    // if your modeler should support overlapping/hierarchical shapes.
    // Note: Currently, the target is defined as the shape at the cursor position.
    // Hence, overlaps are still possible since we do not consider the bounds of the moved shape.
    this.addRule('shape.create', function (context) {
      const { shape, target } = context;
      return canCreate(shape, target);
    });

    this.addRule('elements.create', function (context) {
      const { target, elements } = context;
      return elements.every(function (shape) {
        return canCreate(shape, target);
      });
    });

    this.addRule('elements.move', function (context) {
      // Note: Since it's only about the position, the objects are called "shapes" instead of "elements" in the context object.
      const { target, shapes } = context;
      return canMove(shapes, target);
    });

    // CustomModelerTodo: Define which elements may be resized.
    this.addRule('shape.resize', function (context) {
      if (context.shape.type === `${MODELER_PREFIX}:Transition`) {
        return true;
      }
      return false;
    });

    this.addRule('element.copy', function (context) {
      return true;
    });
  }

  canConnect(source, target) {
    return canConnect(source, target);
  }
}

CustomRuleProvider.$inject = [
  'eventBus', 
  'elementRegistry'
];

// CustomModelerTodo: Define logic to regulate which elements can be connected.
// Must return the type of the connection to be created.
function canConnect(source, target) {
  return ((source.type === `${MODELER_PREFIX}:Place` && target.type === `${MODELER_PREFIX}:Transition`)
    || (source.type === `${MODELER_PREFIX}:Transition` && target.type === `${MODELER_PREFIX}:Place`)
  ) && { type: `${MODELER_PREFIX}:Arc` };
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

function canCreate(shape, target) {
  if (!target) {
    return false;
  }

  return canDrop(shape, target);
}

function canDrop(shape, target) {
  // labels can be moved everywhere
  if (isLabel(shape)) {
    return true;
  }

  // ModelElements (i.e., places, transitions, and arcs) cannot be dropped on other ModelElements
  if (is(shape, `${MODELER_PREFIX}:ModelElement`)) {
    return !is(target, `${MODELER_PREFIX}:ModelElement`);
  }

  return false;
}
