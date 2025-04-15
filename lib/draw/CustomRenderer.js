import { query as domQuery } from "min-dom";
import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";
import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  classes as svgClasses
} from 'tiny-svg';
import {
  assign,
  isObject
} from 'min-dash';
import { componentsToPath } from 'diagram-js/lib/util/RenderUtil';
import Ids from "ids";

import { DEFAULT_TEXT_SIZE } from "./TextRenderer";
import { getLabel } from "../modeling/LabelUtil";
import { MODELER_PREFIX } from "../util/constants";

const RENDERER_IDS = new Ids();

export default class CustomRenderer extends BaseRenderer {
  constructor(eventBus, styles, canvas, textRenderer) {
    super(eventBus, 2000);

    this._styles = styles;
    this._canvas = canvas;
    this._textRenderer = textRenderer;
    this._markers = {};
    this._rendererId = RENDERER_IDS.next();
    this._defaultLineStyle = {
      strokeLinejoin: 'round',
      strokeWidth: 2,
      stroke: 'black'
    };
  }

  canRender(element) {
    return true;
  }

  // CustomModelerTodo: Implement the rendering of the different shapes.
  drawShape(parentGfx, element) {
    if (element.type === `${MODELER_PREFIX}:Place`) {
      return this.drawPlace(parentGfx, element);
    } else if (element.type === `${MODELER_PREFIX}:Transition`) {
      return this.drawTransition(parentGfx, element);
    } else if (element.type === `${MODELER_PREFIX}:Arc`) {
      return this.drawArc(parentGfx, element);
    } else if (element.type === 'label') {
      return this.renderExternalLabel(parentGfx, element);
    }
  }

  drawConnection(parentGfx, element) {
    return this.drawShape(parentGfx, element);
  }

  drawPlace = function (parentGfx, element) {
    // const shape = svgCreate('path');
    // svgAttr(shape, {
    //   d: getPlacePath(0, 0, element.width, element.height),
    //   fill: 'white',
    //   fillOpacity: 0.95,
    //   stroke: 'black',
    //   strokeWidth: 2
    // });
    // svgAppend(parentGfx, shape);
    const circle = this.drawCircle(parentGfx, element.width, element.height, 0, {});

    const marking = element.businessObject.marking;
    if (marking) {
      this.renderMarking(parentGfx, element, marking.toString());
    }

    return circle;
  }

  drawCircle(parentGfx, width, height, offset, attrs) {
    // Cheeky way to allow for optional parameters ...
    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    attrs = this._styles.computeStyle(attrs, {
      stroke: 'black',
      strokeWidth: 2,
      fill: 'white'
    });

    // Not sure why it's necessary
    if (attrs.fill === 'none') {
      delete attrs.fillOpacity;
    }

    const cx = width / 2;
    const cy = height / 2;

    const circle = svgCreate('circle', {
      cx,
      cy,
      r: Math.round((width + height) / 4 - offset),
      ...attrs
    });

    svgAppend(parentGfx, circle);

    return circle;
  }

  renderMarking(parentGfx, element, marking) {
    return this.renderLabel(parentGfx, marking, {
      box: element,
      align: 'center-middle',
      padding: 5,
      style: {
        fill: 'black',
        fontSize: 20
      },
    });
  }

  drawTransition = function (parentGfx, element) {
    const shape = svgCreate('path');
    svgAttr(shape, {
      d: getTransitionPath(0, 0, element.width, element.height),
      fill: 'white',
      fillOpacity: 0.95,
      stroke: 'black',
      strokeWidth: 2
    });
    svgAppend(parentGfx, shape);

    this.renderEmbeddedLabel(parentGfx, element, 'center-middle', element.textSize || DEFAULT_TEXT_SIZE);
    return parentGfx;
  }

  drawArc = function (parentGfx, element) {
    const pathData = this.getPathDataFromConnection(element);
    const color = 'black';

    const attrs = this._styles.computeStyle({
      markerEnd: this.marker('defaultarc-end', color, color)
    }, ['no-fill'], this._defaultLineStyle);

    const arc = svgCreate('path');
    svgAttr(arc, { d: pathData });
    svgAttr(arc, attrs);

    svgAppend(parentGfx, arc);

    return arc;
  }

  getPathDataFromConnection(connection) {
    const waypoints = connection.waypoints;
    let pathData = 'm  ' + waypoints[0].x + ',' + waypoints[0].y;

    for (let i = 1; i < waypoints.length; i++) {
      pathData += 'L' + waypoints[i].x + ',' + waypoints[i].y + ' ';
    }
    return pathData;
  }

  marker(type, fill, stroke) {
    const id = type + '-' + colorEscape(fill) + '-' + colorEscape(stroke) + '-' + this._rendererId;

    if (!this._markers[id]) {
      this.createMarker(id, type, fill, stroke);
    }

    return 'url(#' + id + ')';
  }

  createMarker(id, type, fill, stroke) {
    if (type === 'defaultarc-end') {
      const defaultarcEnd = svgCreate('path', {
        d: 'M 1 5 L 11 10 L 1 15 Z',
        fill,
        stroke,
        strokeLinecap: 'round',
      });

      this.addMarker(id, {
        element: defaultarcEnd,
        ref: { x: 11, y: 10 },
        scale: 0.5,
      });
    }
  }

  addMarker(id, options) {
    const {
      ref = { x: 0, y: 0 },
      scale = 1,
      element
    } = options;

    const marker = svgCreate('marker', {
      id,
      viewBox: '0 0 20 20',
      refX: ref.x,
      refY: ref.y,
      markerWidth: 20 * scale,
      markerHeight: 20 * scale,
      orient: 'auto'
    });
    svgAppend(marker, element);

    let defs = domQuery('defs', this._canvas._svg);

    if (!defs) {
      defs = svgCreate('defs');
      svgAppend(this._canvas._svg, defs);
    }

    svgAppend(defs, marker);

    this._markers[id] = marker;
  }

  renderLabel(parentGfx, label, attrs = {}) {
    // Why?
    attrs = assign({
      size: {
        width: 100
      }
    }, attrs);

    const text = this._textRenderer.createText(label, attrs);

    svgClasses(text).add('djs-label');

    svgAppend(parentGfx, text);

    return text;
  }

  renderEmbeddedLabel(parentGfx, element, align, fontSize) {
    return this.renderLabel(parentGfx, getLabel(element), {
      box: element,
      align: align,
      padding: 5,
      style: {
        fill: element.color === 'black' ? 'white' : 'black',
        fontSize: fontSize || DEFAULT_TEXT_SIZE
      },
    });
  }

  renderExternalLabel = function (parentGfx, element, attrs = {}) {
    const box = {
      width: 90,
      height: 30,
      x: element.width / 2 + element.x,
      y: element.height / 2 + element.y
    };

    return this.renderLabel(parentGfx, getLabel(element), {
      box: box,
      fitBox: true,
      style: assign(
        {},
        this._textRenderer.getExternalStyle(),
        {
          fill: 'black'
        }
      )
    });
  }

  getShapePath(element) {
    if (element.type === `${MODELER_PREFIX}:Place`) {
      return getPlacePath(element.x, element.y, element.width, element.height);
    } else if (element.type === `${MODELER_PREFIX}:Transition`) {
      return getTransitionPath(element.x, element.y, element.width, element.height);
    }
  }    
}

CustomRenderer.$inject = [
  'eventBus',
  'styles',
  'canvas',
  'textRenderer'
];

// helpers
function colorEscape(colorString) {
  // only allow characters and numbers
  return colorString.replace(/[^0-9a-zA-z]+/g, '_');
}

// The following functions return the svg path for the respective shapes.
// For further details, see https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
function getTransitionPath(x, y, width, height) {
  return componentsToPath([
    ['M', x, y],
    ['h', width],
    ['v', height],
    ['h', -width],
    ['z']
  ]);
}

function getPlacePath(x, y, width, height) {
  const radius = width / 2;

  // Get center coordinates of the circle
  const cx = x + radius;
  const cy = y + radius;

  return componentsToPath([
    ['M', cx, cy],
    ['m', 0, -radius],
    ['a', radius, radius, 0, 1, 1, 0, 2 * radius],
    ['a', radius, radius, 0, 1, 1, 0, -2 * radius]
  ]);
}
