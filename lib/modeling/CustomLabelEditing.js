import { assign } from "min-dash";
import { isLabel } from "diagram-js/lib/util/ModelUtil";
import { existsExternalLabel, getExternalLabelMid, getLabel, requiresExternalLabel } from "./LabelUtil";
import { MODELER_PREFIX } from "../util/constants";

export default class CustomLabelEditing {
  constructor(eventBus, canvas, directEditing, commandStack, textRenderer) {
    this._commandStack = commandStack;
    this._canvas = canvas;
    this._textRenderer = textRenderer;

    directEditing.registerProvider(this);

    eventBus.on('element.dblclick', function (event) {
      directEditing.activate(event.element);
    });

    // complete on followup canvas operation
    eventBus.on([
      'autoPlace.start',
      'canvas.viewbox.changing',
      'drag.init',
      'element.mousedown',
      'popupMenu.open'
    ], function (event) {
      if (directEditing.isActive()) {
        directEditing.complete();
      }
    });

    // cancel on command stack changes (= when some other action is done)
    eventBus.on('commandStack.changed', function () {
      if (directEditing.isActive()) {
        directEditing.cancel();
      }
    });

    eventBus.on('create.end', 500, function (event) {
      const context = event.context;
      const element = context.shape;

      if (!context.canExecute) {
        return;
      }

      // What does it do?
      if (context.hints && context.hints.createElementsBehavior === false) {
        return;
      }

      directEditing.activate(element);
    });

    eventBus.on('autoPlace.end', 500, function (event) {
      directEditing.activate(event.shape);
    });
  }

  activate(element) {
    const text = getLabel(element) || '';

    const editingBox = this.getEditingBBox(element);

    let options = {};

    // CustomModelerTodo: Assign label options per element type.
    if (element.type === `${MODELER_PREFIX}:Transition`) {
      assign(options, {
        centerVertically: true
      });
    }

    if (element.type === `${MODELER_PREFIX}:Place` || element.type === `${MODELER_PREFIX}:Arc`) {
      assign(options, {
        autoResize: true
      });
    }

    const context = {
      text: text,
      bounds: editingBox.bounds,
      style: editingBox.style,
      options: options
    };

    return context;
  }

  getEditingBBox(element) {
    const canvas = this._canvas;
    const zoom = canvas.zoom();

    // Relevant if label is external
    const target = element;

    const bbox = canvas.getAbsoluteBBox(target);

    const mid = {
      x: bbox.x + bbox.width / 2,
      y: bbox.y + bbox.height / 2
    };

    // Default bounds
    let bounds = { x: bbox.x, y: bbox.y };

    const defaultStyle = this._textRenderer.getDefaultStyle();
    const externalStyle = this._textRenderer.getExternalStyle();

    const zoomedDefaultFontSize = defaultStyle.fontSize * zoom;
    const zoomedExternalFontSize = externalStyle.fontSize * zoom;
    const defaultLineHeight = defaultStyle.lineHeight;
    const externalLineHeight = externalStyle.lineHeight;

    // Default style
    let style = {
      fontFamily: defaultStyle.fontFamily,
      fontWeight: defaultStyle.fontWeight,
    };

    // Internal labels for transitions
    if (element.type === `${MODELER_PREFIX}:Transition`) {
      assign(bounds, {
        width: bbox.width,
        height: bbox.height
      });

      assign(style, {
        fontSize: zoomedDefaultFontSize + 'px',
        lineHeight: defaultLineHeight,
        paddingTop: (7 * zoom) + 'px',
        paddingBottom: (7 * zoom) + 'px',
        paddingLeft: (5 * zoom) + 'px',
        paddingRight: (5 * zoom) + 'px'
      });
    }

    // External labels
    const width = 90 * zoom;
    const paddingTop = 7 * zoom;
    const paddingBottom = 4 * zoom;

    // Existing external labels for places and arcs
    if (target.labelTarget) {
      assign(bounds, {
        width: width,
        height: bbox.height + paddingTop + paddingBottom,
        x: mid.x - width / 2,
        y: bbox.y - paddingTop
      });

      assign(style, {
        fontSize: zoomedExternalFontSize + 'px',
        lineHeight: externalLineHeight,
        paddingTop: paddingTop + 'px',
        paddingBottom: paddingBottom + 'px'
      });
    }

    // External label does not exist yet
    // !isLabel(target.label) is used by bpmn.js, not sure why
    if (!isLabel(target) && requiresExternalLabel(target) && !existsExternalLabel(target)) {
      const externalLabelMid = getExternalLabelMid(element);

      const absoluteBBox = canvas.getAbsoluteBBox({
        x: externalLabelMid.x,
        y: externalLabelMid.y,
        width: 0,
        height: 0
      });

      const height = zoomedExternalFontSize + paddingTop + paddingBottom;

      assign(bounds, {
        width: width,
        height: height,
        x: absoluteBBox.x - width / 2,
        y: absoluteBBox.y - height / 2
      });

      assign(style, {
        fontSize: zoomedExternalFontSize + 'px',
        lineHeight: externalLineHeight,
        paddingTop: paddingTop + 'px',
        paddingBottom: paddingBottom + 'px'
      });
    }

    return { bounds: bounds, style: style };

  }

  update(element, newLabel) {
    this._commandStack.execute('element.updateLabel', {
      element: element,
      newLabel: newLabel
    });
  }
}

CustomLabelEditing.$inject = [
  'eventBus',
  'canvas',
  'directEditing',
  'commandStack',
  'textRenderer'
];
