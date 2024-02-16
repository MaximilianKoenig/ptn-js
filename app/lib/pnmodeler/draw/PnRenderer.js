import inherits from "inherits";
import BaseRenderer from "diagram-js/lib/draw/BaseRenderer";
import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  classes as svgClasses
} from 'tiny-svg';
import {
  isObject
} from 'min-dash';
import { componentsToPath } from 'diagram-js/lib/util/RenderUtil';


export default function PnRenderer(eventBus, styles) {
  BaseRenderer.call(this, eventBus, 2000);

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
    return parentGfx;
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
    return parentGfx;
  };

  this.drawArc = function (parentGfx, element) {
    const arcData = getArcDataFromConnection(element);
  };

  function getArcDataFromConnection(connection) {
    console.log(connection);
    const waypoints = connection.waypoints;
  }
}

inherits(PnRenderer, BaseRenderer);

PnRenderer.$inject = [
  'eventBus',
  'styles'
];

PnRenderer.prototype.canRender = function (element) {
  return true;
};

PnRenderer.prototype.drawShape = function (parentGfx, element) {
  console.log(element);
  if (element.type === 'pn:Place') {
    return this.drawPlace(parentGfx, element);
  } else if (element.type === 'pn:Transition') {
    return this.drawTransition(parentGfx, element);
  } else if (element.type === 'pn:Arc') {
    return this.drawArc(parentGfx, element);
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
