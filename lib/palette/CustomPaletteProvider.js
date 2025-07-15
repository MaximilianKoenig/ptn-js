import {
    assign
} from "min-dash";
import { MODELER_PREFIX } from "../util/constants";

export default class CustomPaletteProvider {
  constructor(palette, create, elementFactory, spaceTool, lassoTool, handTool, globalConnect, translate) {
    this._create = create;
    this._elementFactory = elementFactory;
    this._spaceTool = spaceTool;
    this._lassoTool = lassoTool;
    this._handTool = handTool;
    this._globalConnect = globalConnect;
    this._translate = translate;

    palette.registerProvider(this);
  }

  getPaletteEntries(element) {
    const actions = {}, create = this._create, elementFactory = this._elementFactory, spaceTool = this._spaceTool, lassoTool = this._lassoTool, handTool = this._handTool, globalConnect = this._globalConnect, translate = this._translate;

    function createAction(type, group, className, title, options) {
      function createListener(event) {
        const shape = elementFactory.createShape(assign({ type: type }, options));
        create.start(event, shape);
      }

      return {
        group: group,
        className: className,
        title: title,
        action: {
          dragstart: createListener,
          click: createListener
        }
      };
    }

    assign(actions, {
      // Common editor actions
      'hand-tool': {
        group: 'tools',
        className: 'bpmn-icon-hand-tool',
        title: translate('Activate the hand tool'),
        action: {
          click: function (event) {
            handTool.activateHand(event);
          }
        }
      },
      'lasso-tool': {
        group: 'tools',
        className: 'bpmn-icon-lasso-tool',
        title: translate('Activate the lasso tool'),
        action: {
          click: function (event) {
            lassoTool.activateSelection(event);
          }
        }
      },
      'space-tool': {
        group: 'tools',
        className: 'bpmn-icon-space-tool',
        title: translate('Activate the create/remove space tool'),
        action: {
          click: function (event) {
            spaceTool.activateSelection(event);
          }
        }
      },
      // The light gray horizontal line between tool and modeling palette actions
      'tool-separator': {
        group: 'tools',
        separator: true
      },

      // Modeler-specific actions
      // CustomModelerTodo: Add custom palette actions here, usually for creating elements.
      'create-place': createAction(
        `${MODELER_PREFIX}:Place`, 'custom-elements', 'pn-icon-place', translate('Create place')
      ),
      'create-transition': createAction(
        `${MODELER_PREFIX}:Transition`, 'custom-elements', 'pn-icon-transition', translate('Create transition')
      )
    });
    return actions;
  }
}

CustomPaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory',
  'spaceTool',
  'lassoTool',
  'handTool',
  'globalConnect',
  'translate'
];
