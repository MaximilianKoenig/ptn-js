import inherits from "inherits";
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

const RENDERER_IDS = new Ids();

export default function PnRenderer(eventBus, styles, canvas, textRenderer) {
  BaseRenderer.call(this, eventBus, 2000);

  const markers = {};
  const rendererId = RENDERER_IDS.next();

  const defaultLineStyle = {
    strokeLinejoin: 'round',
    strokeWidth: 2,
    stroke: 'black'
  };

  function drawCircle(parentGfx, width, height, offset, attrs) {
    // Cheeky way to allow for optional parameters ...
    if (isObject(offset)) {
      attrs = offset;
      offset = 0;
    }

    offset = offset || 0;

    attrs = styles.computeStyle(attrs, {
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

  // TODO: Check whether we can use the "getPath" functions to retrieve svg paths from a dictionary
  this.drawPlace = function (parentGfx, element) {
    // const shape = svgCreate('path');
    // svgAttr(shape, {
    //   d: getPlacePath(0, 0, element.width, element.height),
    //   fill: 'white',
    //   fillOpacity: 0.95,
    //   stroke: 'black',
    //   strokeWidth: 2
    // });
    // svgAppend(parentGfx, shape);
    const circle = drawCircle(parentGfx, element.width, element.height, 0, {});
    if (element.businessObject.name) {
      renderExternalLabel(parentGfx, element, {});
    }
    return circle;
  };

  this.drawTransition = function (parentGfx, element) {
    const shape = svgCreate('path');
    svgAttr(shape, {
      d: getTransitionPath(0, 0, element.width, element.height),
      fill: 'white',
      fillOpacity: 0.95,
      stroke: 'black',
      strokeWidth: 2
    });
    svgAppend(parentGfx, shape);

    renderEmbeddedLabel(parentGfx, element, 'center-middle', element.textSize || DEFAULT_TEXT_SIZE);
    return parentGfx;
  };

  this.drawArc = function (parentGfx, element) {
    const pathData = getPathDataFromConnection(element);

    const color = 'black';

    const attrs = styles.computeStyle({
      markerEnd: marker('defaultarc-end', color, color)
    }, [ 'no-fill' ], defaultLineStyle);

    const arc = svgCreate('path');
    svgAttr(arc, { d: pathData });
    svgAttr(arc, attrs);

    svgAppend(parentGfx, arc);

    // TODO: Check if this is necessary or results in duplicated labels
    // if (element.businessObject.weight) {
    //   renderExternalLabel(parentGfx, element, {});
    // }

    return arc;
  };

  function getPathDataFromConnection(connection) {
    const waypoints = connection.waypoints;

    let pathData = 'm  ' + waypoints[0].x + ',' + waypoints[0].y;
    for (let i = 1; i < waypoints.length; i++) {
      pathData += 'L' + waypoints[i].x + ',' + waypoints[i].y + ' ';
    }
    return pathData;
  }

  // Move to helpers
  function colorEscape(colorString) {
    // only allow characters and numbers
    return colorString.replace(/[^0-9a-zA-z]+/g, '_');
  }

  function marker(type, fill, stroke) {
    const id = type + '-' + colorEscape(fill) + '-' + colorEscape(stroke) + '-' + rendererId;

    if (!markers[id]) {
      createMarker(id, type, fill, stroke);
    }

    return 'url(#' + id + ')';
  }

  function createMarker(id, type, fill, stroke){
    if (type === 'defaultarc-end') {
      const defaultarcEnd = svgCreate('path', {
        d: 'M 1 5 L 11 10 L 1 15 Z',
        fill,
        stroke,
        strokeLinecap: 'round',
      });

      addMarker(id, {
        element: defaultarcEnd,
        ref: { x: 11, y: 10 },
        scale: 0.5,
      });
    }
  }

  function addMarker(id, options) {
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

    var defs = domQuery('defs', canvas._svg);
  
    if (!defs) {
      defs = svgCreate('defs');
  
      svgAppend(canvas._svg, defs);
    }
  
    svgAppend(defs, marker);
  
    markers[id] = marker;
  }

  function renderLabel(parentGfx, label, attrs = {}) {
    // Why?
    attrs = assign({
      size: {
        width: 100
      }
    }, attrs);

    const text = textRenderer.createText(label, attrs);

    svgClasses(text).add('djs-label');

    svgAppend(parentGfx, text);

    return text;
  }

  function renderEmbeddedLabel(parentGfx, element, align, fontSize) {
    return renderLabel(parentGfx, getLabel(element), {
      box: element,
      align: align,
      padding: 5,
      style: {
        fill: element.color === 'black' ? 'white' : 'black',
        fontsize: fontSize || DEFAULT_TEXT_SIZE
      },
    })
  }

  function renderExternalLabel(parentGfx, element, attrs = {}) {
    const box = {
      width: 90,
      height: 30,
      x: element.width / 2 + element.x,
      y: element.height / 2 + element.y
    };

    return renderLabel(parentGfx, getLabel(element), {
      box: box,
      fitBox: true,
      style: assign(
        {},
        textRenderer.getExternalStyle(),
        {
          fill: 'black'
        }
      )
    });
  }
}

inherits(PnRenderer, BaseRenderer);

PnRenderer.$inject = [
  'eventBus',
  'styles',
  'canvas',
  'textRenderer'
];

PnRenderer.prototype.canRender = function (element) {
  return true;
};

PnRenderer.prototype.drawShape = function (parentGfx, element) {
  if (element.type === 'ptn:Place') {
    return this.drawPlace(parentGfx, element);
  } else if (element.type === 'ptn:Transition') {
    return this.drawTransition(parentGfx, element);
  } else if (element.type === 'ptn:Arc') {
    return this.drawArc(parentGfx, element);
  } else if (element.type === 'label') {
    return this.renderExternalLabel(parentGfx, element);
  }
};

PnRenderer.prototype.drawConnection = PnRenderer.prototype.drawShape;

PnRenderer.prototype.getShapePath = function (element) {
  if (element.type === 'ptn:Place') {
    return getPlacePath(element.x, element.y, element.width, element.height);
  } else if (element.type === 'ptn:Transition') {
    return getTransitionPath(element.x, element.y, element.width, element.height);
  }
};

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
